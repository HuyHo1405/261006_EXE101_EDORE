"""
openrouter_service.py — Service giao tiếp với OpenRouter API

Các phiên bản method:
1. generate_chat_completion()   — Sync call, trả về dict (giữ nguyên backward-compat)
2. stream_chat_completion()     — Generator, yield từng token qua SSE
3. map_knowledge_to_template()  — Feature 2: map với section-aware chunking
4. enrich_single_node()         — Feature 3: enrich 1 node (dùng cho parallel)
5. enrich_nodes_with_activities() — Feature 3: enrich toàn bộ (backward-compat)
6. parallel_enrich_nodes()      — Feature 3: enrich song song toàn bộ nodes
"""

import requests
import json
import re
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Generator, List, Dict, Any, Optional
from flask import current_app


# ─── JSON Schema Definitions ──────────────────────────────────────────────────
# Dùng trong system prompt để ép AI trả về đúng cấu trúc

MAPPED_NODE_SCHEMA = """{
  "node_type": "string — ENUM ngắn gọn, một trong: 'Khởi động', 'Lý thuyết cốt lõi', 'Thực hành & Vận dụng'",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này trong bài học (VD: 'Khái niệm End User và Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm của node này",
  "mapped_knowledge": ["string — Khái niệm/điểm kiến thức 1", "..."],
  "node_content": ["string — Ý chính nội dung kiến thức giảng dạy tương ứng chi tiết của node này lấy từ tài liệu gốc, viết dưới dạng các gạch đầu dòng chuẩn, rõ ràng, không tóm tắt quá ngắn"]
}"""

ENRICHED_NODE_SCHEMA = """{
  "node_type": "string — ENUM ngắn gọn, một trong: 'Khởi động', 'Lý thuyết cốt lõi', 'Thực hành & Vận dụng'",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này (VD: 'Phân tích vai trò End User vs Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm",
  "mapped_knowledge": ["string"],
  "node_content": ["string — Nội dung kiến thức giảng dạy tương ứng của node này (dưới dạng danh sách các gạch đầu dòng chi tiết, đầy đủ)"],
  "applied_activity": "string — Tên hoạt động dạy học được chọn từ RAG",
  "execution_steps": ["string — Bước thực hiện chi tiết 1", "..."],
  "estimated_time_minutes": "number — Thời gian ước tính (phút)",
  "materials_needed": ["string — Vật liệu/công cụ cần thiết"]
}"""


class OpenRouterService:

    # ─── Headers ──────────────────────────────────────────────────────────────

    @staticmethod
    def get_headers() -> dict:
        api_key = current_app.config.get('OPENROUTER_API_KEY')
        if not api_key:
            raise ValueError("OPENROUTER_API_KEY is not set in the configuration/environment.")

        return {
            "Authorization": f"Bearer {api_key}",
            "HTTP-Referer": "http://localhost:5000",
            "X-Title": "Flask REST API Backend",
            "Content-Type": "application/json",
        }

    # ─── Sync Chat Completion (backward-compat) ────────────────────────────────

    @classmethod
    def generate_chat_completion(
        cls,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> dict:
        """
        Gọi OpenRouter synchronously và trả về dict kết quả.
        Giữ nguyên interface cũ để backward-compatible với routes hiện tại.
        """
        url = current_app.config.get('OPENROUTER_BASE_URL')
        selected_model = model or current_app.config.get('OPENROUTER_MODEL')

        payload = {
            "model": selected_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
        }

        try:
            response = requests.post(
                url,
                headers=cls.get_headers(),
                json=payload,
                timeout=120,  # Tăng từ 60s → 120s: map phase với large doc có thể mất 60-90s
            )
            response.raise_for_status()
            data = response.json()

            if "choices" in data and len(data["choices"]) > 0:
                choice = data["choices"][0]
                return {
                    "success": True,
                    "content": choice.get("message", {}).get("content", ""),
                    "model": data.get("model", selected_model),
                    "usage": data.get("usage", {}),
                }
            else:
                return {
                    "success": False,
                    "error": "Empty or unexpected response structure from OpenRouter API.",
                    "raw_response": data,
                }

        except requests.exceptions.HTTPError as http_err:
            error_message = f"HTTP error occurred: {http_err}"
            try:
                error_details = response.json()
                error_message += f" - details: {error_details}"
            except Exception:
                pass
            return {"success": False, "error": error_message}

        except requests.exceptions.RequestException as req_err:
            return {"success": False, "error": f"Network request failed: {req_err}"}

        except ValueError as val_err:
            return {"success": False, "error": str(val_err)}

    # ─── Streaming Chat Completion ─────────────────────────────────────────────

    @classmethod
    def stream_chat_completion(
        cls,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 2000,
    ) -> Generator[str, None, None]:
        """
        Generator: Yield từng token chunk từ OpenRouter qua SSE.

        Yields:
            str: Từng delta token text (hoặc chuỗi rỗng khi nhận [DONE])

        Raises:
            ValueError: Nếu OPENROUTER_API_KEY chưa set
            requests.exceptions.RequestException: Nếu network error
        """
        url = current_app.config.get('OPENROUTER_BASE_URL')
        selected_model = model or current_app.config.get('OPENROUTER_MODEL')

        payload = {
            "model": selected_model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": True,
        }

        with requests.post(
            url,
            headers=cls.get_headers(),
            json=payload,
            stream=True,
            timeout=180,  # Stream timeout cao hơn: pipeline có thể mất 2-3 phút tổng
        ) as response:
            response.raise_for_status()
            for raw_line in response.iter_lines(decode_unicode=True):
                if not raw_line:
                    continue
                if raw_line.startswith("data: "):
                    data_str = raw_line[6:].strip()
                    if data_str == "[DONE]":
                        return
                    try:
                        data = json.loads(data_str)
                        delta = (
                            data.get("choices", [{}])[0]
                            .get("delta", {})
                            .get("content", "")
                        )
                        if delta:
                            yield delta
                    except json.JSONDecodeError:
                        continue  # Skip malformed lines

    # ─── Feature 2: Map với Section-aware Chunking ────────────────────────────

    @classmethod
    def map_knowledge_to_template(
        cls,
        extracted_knowledge: str,
        system_template: str,
        model: str = None,
        temperature: float = 0.3,
        use_chunking: bool = False,
        section_contexts: Dict[str, str] = None,
    ) -> dict:
        """
        Feature 2: Map extracted knowledge → lesson nodes.

        Args:
            extracted_knowledge: Full text hoặc chunked context
            system_template: Template string định nghĩa các node
            use_chunking: Nếu True, section_contexts phải được cung cấp
            section_contexts: { node_name → context_string } từ chunking_service

        Returns:
            dict: { "success": bool, "content": str (JSON array), ... }
        """
        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            "Your task is to map the provided key concepts into a pre-defined lesson template.\n\n"
            "CRITICAL RULES:\n"
            "1. Use ONLY information from the provided text. Do NOT add external knowledge.\n"
            "2. Every piece of knowledge must be mapped to exactly one node.\n"
            "3. Respond ONLY with a valid JSON array. No markdown, no extra text.\n\n"
            "Each object in the array MUST follow this exact schema:\n"
            f"{MAPPED_NODE_SCHEMA}\n\n"
            "The array must contain one object per node in the template."
        )
        # Context size cap: mỗi section tối đa 3000 chars, tổng tối đa 12000 chars
        # Tránh trường hợp 5 chunks x 3 sections x 2000 chars = 30KB -> timeout
        MAX_CHARS_PER_SECTION = 3000
        MAX_TOTAL_CONTEXT_CHARS = 12000

        if use_chunking and section_contexts:
            # Section-aware: format context theo từng node, có cap
            context_parts = []
            total_chars = 0
            for node_name, context in section_contexts.items():
                # Cắt mỗi section context nếu quá dài
                capped_context = context[:MAX_CHARS_PER_SECTION]
                if len(context) > MAX_CHARS_PER_SECTION:
                    capped_context += "\n...[truncated]"
                section_block = f"=== Context for '{node_name}' ===\n{capped_context}"
                # Dừng nếu tổng context đã quá giới hạn
                if total_chars + len(section_block) > MAX_TOTAL_CONTEXT_CHARS:
                    break
                context_parts.append(section_block)
                total_chars += len(section_block)
            knowledge_block = "\n\n".join(context_parts)
        else:
            # Full text fallback: cắt ở 10000 chars để an toàn
            knowledge_block = extracted_knowledge[:10000]
            if len(extracted_knowledge) > 10000:
                knowledge_block += "\n...[truncated for context limit]"

        user_content = (
            f"EXTRACTED KNOWLEDGE (use ONLY this as your source):\n"
            f"{knowledge_block}\n\n"
            f"LESSON TEMPLATE (map knowledge into these nodes):\n"
            f"{system_template}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        return cls.generate_chat_completion(
            messages, model=model, temperature=temperature, max_tokens=2000
        )

    # ─── Feature 3: Enrich Single Node (dùng cho parallel) ───────────────────

    @classmethod
    def enrich_single_node(
        cls,
        node: Any,
        rag_activities: Any,
        model: str = None,
        temperature: float = 0.5,
        section_context: str = None,
    ) -> dict:
        """
        Enrich MỘT node duy nhất với hoạt động dạy học phù hợp.
        Dùng để gọi song song qua parallel_enrich_nodes().

        Args:
            node: Object của 1 node đã được map (dict hoặc str JSON)
            rag_activities: Danh sách hoạt động dạy học
            section_context: Optional — context chunk riêng cho node này
            model, temperature: Override params

        Returns:
            dict: { "success": bool, "content": str (enriched node JSON), ... }
        """
        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            "For the given lesson node, select and adapt the MOST SUITABLE teaching activity "
            "from the provided list. The activity must align with the node's intent and knowledge content.\n\n"
            "CRITICAL RULES:\n"
            "1. Use ONLY activities from the provided list. Adapt them — do not invent new ones.\n"
            "2. Execution steps must be specific, actionable, and practical for a classroom.\n"
            "3. Keep and pass through the 'node_content' array from the input node exactly into your response.\n"
            "4. Respond ONLY with a single valid JSON object. No markdown, no array, no extra text.\n\n"
            "The object MUST follow this exact schema:\n"
            f"{ENRICHED_NODE_SCHEMA}"
        )

        node_str = json.dumps(node, ensure_ascii=False) if isinstance(node, dict) else str(node)
        activities_str = (
            json.dumps(rag_activities, ensure_ascii=False)
            if isinstance(rag_activities, (list, dict))
            else str(rag_activities)
        )

        context_block = ""
        if section_context:
            context_block = (
                f"\nSOURCE CONTEXT (relevant document excerpts for this node):\n"
                f"{section_context[:2000]}\n"
            )

        user_content = (
            f"LESSON NODE TO ENRICH:\n{node_str}\n"
            f"{context_block}\n"
            f"AVAILABLE TEACHING ACTIVITIES (choose the best fit):\n{activities_str}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        return cls.generate_chat_completion(
            messages, model=model, temperature=temperature, max_tokens=1500
        )

    # ─── Feature 3: Enrich All Nodes (backward-compat, sequential) ────────────

    @classmethod
    def enrich_nodes_with_activities(
        cls,
        mapped_nodes: Any,
        rag_activities: Any,
        model: str = None,
        temperature: float = 0.5,
    ) -> dict:
        """
        Enrich toàn bộ nodes TUẦN TỰ (backward-compatible với routes cũ).
        Dùng parallel_enrich_nodes() nếu muốn tối ưu performance.
        """
        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            "For every mapped node, select and adapt the most sensible activity from the provided list "
            "that bridges the node's intent with the assigned core content.\n\n"
            "CRITICAL RULES:\n"
            "1. Use ONLY activities from the provided list.\n"
            "2. Keep and pass through the 'node_content' array from each input node exactly into your response objects.\n"
            "3. Respond ONLY with a valid JSON array of objects. No markdown, no extra text.\n\n"
            "Each object in the array MUST follow this exact schema:\n"
            f"{ENRICHED_NODE_SCHEMA}"
        )

        nodes_str = (
            json.dumps(mapped_nodes, ensure_ascii=False)
            if isinstance(mapped_nodes, (list, dict))
            else str(mapped_nodes)
        )
        activities_str = (
            json.dumps(rag_activities, ensure_ascii=False)
            if isinstance(rag_activities, (list, dict))
            else str(rag_activities)
        )

        user_content = (
            f"MAPPED NODES:\n{nodes_str}\n\n"
            f"AVAILABLE RAG ACTIVITIES:\n{activities_str}"
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        return cls.generate_chat_completion(
            messages, model=model, temperature=temperature, max_tokens=3000
        )

    # ─── Feature 3: Parallel Enrich ───────────────────────────────────────────

    @classmethod
    def parallel_enrich_nodes(
        cls,
        nodes: List[Any],
        rag_activities: Any,
        model: str = None,
        temperature: float = 0.5,
        section_contexts: Dict[str, str] = None,
        max_workers: int = 3,
    ) -> dict:
        """
        Enrich toàn bộ nodes SONG SONG dùng ThreadPoolExecutor.
        Tổng thời gian ≈ thời gian của node chậm nhất (không phải tổng tất cả).

        Args:
            nodes: List các node objects đã được map
            rag_activities: Danh sách hoạt động dạy học
            section_contexts: { node_name → context } từ chunking_service (optional)
            max_workers: Số thread parallel tối đa (default 3 = số node mặc định)
            model, temperature: Override params

        Returns:
            dict: {
                "success": bool,
                "content": list — Danh sách enriched nodes theo thứ tự gốc,
                "errors": list — Danh sách lỗi nếu có (per node),
                "partial": bool — True nếu một số node thất bại nhưng có kết quả một phần
            }
        """
        if not nodes:
            return {"success": False, "error": "No nodes to enrich."}

        # Parse nodes nếu là JSON string
        if isinstance(nodes, str):
            try:
                nodes = json.loads(nodes)
            except json.JSONDecodeError:
                return {"success": False, "error": "mapped_nodes is not valid JSON."}

        if not isinstance(nodes, list):
            nodes = [nodes]

        results: List[Optional[dict]] = [None] * len(nodes)
        errors: List[Optional[str]] = [None] * len(nodes)

        # Capture app instance before entering thread execution
        app = current_app._get_current_object()

        def _enrich_task(index: int, node: Any, app_obj: Any) -> tuple:
            """Task chạy trong thread pool."""
            with app_obj.app_context():
                # Lấy context riêng cho node này (nếu có)
                context = None
                if section_contexts and isinstance(node, dict):
                    node_name = node.get("node_name", "")
                    context = section_contexts.get(node_name)

                result = cls.enrich_single_node(
                    node=node,
                    rag_activities=rag_activities,
                    model=model,
                    temperature=temperature,
                    section_context=context,
                )
                return index, result

        with ThreadPoolExecutor(max_workers=min(max_workers, len(nodes))) as executor:
            futures = {
                executor.submit(_enrich_task, i, node, app): i
                for i, node in enumerate(nodes)
            }

            for future in as_completed(futures):
                try:
                    index, result = future.result()
                    if result.get("success"):
                        # Parse single node JSON từ content string
                        content_str = result.get("content", "").strip()
                        content_str = re.sub(r'```json|```', '', content_str).strip()
                        try:
                            parsed_node = json.loads(content_str)
                            results[index] = parsed_node
                        except json.JSONDecodeError:
                            # Nếu không parse được, giữ nguyên string
                            results[index] = {"_raw": content_str}
                            errors[index] = f"Node {index}: JSON parse error on response."
                    else:
                        errors[index] = f"Node {index}: {result.get('error', 'Unknown error')}"
                except Exception as e:
                    idx = futures[future]
                    errors[index] = f"Node {idx}: Thread exception — {str(e)}"

        # Lọc kết quả
        successful = [r for r in results if r is not None]
        actual_errors = [e for e in errors if e is not None]
        has_partial = len(actual_errors) > 0 and len(successful) > 0

        if not successful:
            return {
                "success": False,
                "error": "All node enrichment tasks failed.",
                "errors": actual_errors,
            }

        return {
            "success": True,
            "content": successful,
            "errors": actual_errors if actual_errors else [],
            "partial": has_partial,
        }
