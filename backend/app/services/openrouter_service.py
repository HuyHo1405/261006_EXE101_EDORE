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
import ssl
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Generator, List, Dict, Any, Optional
from flask import current_app
from requests.adapters import HTTPAdapter
from app.models.activity_pool import retrieve_activities

class TLS12Adapter(HTTPAdapter):
    """
    HTTPAdapter that forces TLS 1.2.
    Cloudflare (which hosts OpenRouter) has known TLS 1.3 session resumption / 0-RTT issues
    on certain network paths and Windows systems, leading to SSLV3_ALERT_BAD_RECORD_MAC.
    Forcing TLS 1.2 bypasses this completely.
    """
    def init_poolmanager(self, *args, **kwargs):
        ctx = ssl.create_default_context()
        try:
            # Modern Python 3.7+ approach
            ctx.minimum_version = ssl.TLSVersion.TLSv1_2
            ctx.maximum_version = ssl.TLSVersion.TLSv1_2
        except AttributeError:
            # Fallback for older python/openssl versions
            ctx.options |= ssl.OP_NO_TLSv1_3
        kwargs['ssl_context'] = ctx
        return super(TLS12Adapter, self).init_poolmanager(*args, **kwargs)


_session = None

def get_session() -> requests.Session:
    global _session
    if _session is None:
        _session = requests.Session()
        # Set connection pool size to handle parallel requests
        adapter = TLS12Adapter(pool_connections=10, pool_maxsize=10)
        _session.mount("https://", adapter)
    return _session


MAX_CONTEXT_CHARS = 6000  # ~2000 tokens

def safe_truncate_context(context: str, max_chars: int = MAX_CONTEXT_CHARS) -> str:
    if not context:
        return ""
    if len(context) <= max_chars:
        return context
    # Cắt tại ranh giới chunk (dấu "---") thay vì cắt giữa chừng
    parts = context.split("\n\n---\n\n")
    result = ""
    for part in parts:
        if len(result) + len(part) + (4 if result else 0) > max_chars:
            break
        if result:
            result += "\n\n---\n\n" + part
        else:
            result = part
    return result.strip()


# ─── JSON Schema Definitions ──────────────────────────────────────────────────
# Dùng trong system prompt để ép AI trả về đúng cấu trúc

MAPPED_NODE_SCHEMA = """{
  "node_type": "string — ENUM ngắn gọn, một trong: 'Khởi động', 'Lý thuyết cốt lõi', 'Thực hành & Vận dụng'",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này trong bài học (VD: 'Khái niệm End User và Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm của node này",
  "mapped_knowledge": ["string — Khái niệm/điểm kiến thức 1", "..."],
  "node_content": ["string — Ý chính nội dung giảng dạy chi tiết của node này lấy từ tài liệu gốc. ĐỊNH DẠNG: Sử dụng Markdown rõ ràng (dùng '###' cho tiêu đề phụ, '-' hoặc '1.' cho danh sách dòng liệt kê, '**chữ**' để tô đậm từ khóa). YÊU CẦU: Giữ nguyên 100% các mốc thời gian, số liệu thô, thuật ngữ kỹ thuật, tên riêng. Độ chính xác thông tin phải đạt trên 90% so với bản gốc."]
}"""

ENRICHED_NODE_SCHEMA = """{
  "node_type": "string — ENUM ngắn gọn, một trong: 'Khởi động', 'Lý thuyết cốt lõi', 'Thực hành & Vận dụng'",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này (VD: 'Phân tích vai trò End User vs Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm",
  "mapped_knowledge": ["string"],
  "node_content": ["string — Nội dung kiến thức giảng dạy tương ứng của node này. ĐỊNH DẠNG: Giữ nguyên định dạng Markdown rõ ràng từ node_content gốc (ví dụ: '###' cho tiêu đề phụ, '-' hoặc '1.' cho danh sách dòng liệt kê, '**chữ**' tô đậm từ khóa) và bảo toàn 100% các mốc thời gian, số liệu thô, thuật ngữ kỹ thuật."],
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

        max_retries = 3
        for attempt in range(max_retries):
            try:
                response = get_session().post(
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

            except (requests.exceptions.RequestException, ssl.SSLError) as req_err:
                if attempt == max_retries - 1:
                    return {"success": False, "error": f"Network request failed after {max_retries} attempts: {req_err}"}
                import time
                time.sleep(1)

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

        with get_session().post(
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
        outline: str = None,
        nodes: List[Dict[str, Any]] = None,
    ) -> dict:
        """
        Feature 2: Map extracted knowledge → lesson nodes.

        Args:
            extracted_knowledge: Full text hoặc chunked context
            system_template: Template string định nghĩa các node
            use_chunking: Nếu True, section_contexts phải được cung cấp
            section_contexts: { node_name → context_string } từ chunking_service
            outline: Cấu trúc outline (headings H1-H3) của tài liệu
            nodes: Danh sách các nodes từ template ban đầu để tạo prompt chính xác

        Returns:
            dict: { "success": bool, "content": str (JSON array), ... }
        """
        node_types_list = []
        if nodes:
            node_types_list = [n.get("node_type") for n in nodes if n.get("node_type")]
        
        unique_types = sorted(list(set(node_types_list))) if node_types_list else ['Khởi động', 'Lý thuyết cốt lõi', 'Thực hành & Vận dụng']
        node_types_str = ", ".join(f"'{nt}'" for nt in unique_types)
        
        dynamic_schema = f"""{{
  "node_type": "string — MUST be exactly one of: {node_types_str}",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này trong bài học (VD: 'Khái niệm End User và Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm của node này",
  "mapped_knowledge": ["string — Khái niệm/điểm kiến thức 1", "..."],
  "node_content": ["string — Ý chính nội dung giảng dạy chi tiết của node này lấy từ tài liệu gốc. ĐỊNH DẠNG: Sử dụng Markdown rõ ràng (dùng '###' cho tiêu đề phụ, '-' hoặc '1.' cho danh sách dòng liệt kê, '**chữ**' để tô đậm từ khóa). YÊU CẦU: Giữ nguyên 100% các mốc thời gian, số liệu thô, thuật ngữ kỹ thuật, tên riêng. Độ chính xác thông tin phải đạt trên 90% so với bản gốc."]
}}"""

        num_nodes = len(nodes) if nodes else 3
        expected_structure = " -> ".join(f"'{n.get('node_type')}'" for n in nodes) if nodes else "3 nodes ('Khởi động' -> 'Lý thuyết cốt lõi' -> 'Thực hành & Vận dụng')"

        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            "Your task is to map the provided key concepts into a pre-defined lesson template.\n\n"
            "CRITICAL RULES:\n"
            "1. Use ONLY information from the provided text. Do NOT add external knowledge. Hallucination is strictly forbidden (0% tolerance).\n"
            "2. Preserve 100% of all original timestamps, dates, quantitative metrics, milestones, and technical/proper names exactly as they are in the source text. Do NOT summarize them out or change them. Language mismatch/paraphrase must be kept under 10% to ensure 90%+ word and detail accuracy.\n"
            f"3. The output JSON array MUST contain exactly {num_nodes} objects, corresponding to the {num_nodes} nodes in the template in the exact order specified.\n"
            "4. Every piece of knowledge must be mapped to exactly one node.\n"
            "5. Respond ONLY with a valid JSON array. No markdown, no extra text.\n"
            "6. Format the elements in 'node_content' array using rich markdown (headings with '###', lists with '-' or '1.', bold text with '**') for visual clarity.\n\n"
            "Each object in the array MUST follow this exact schema:\n"
            f"{dynamic_schema}\n\n"
            f"The array MUST contain exactly {num_nodes} objects, one for each node in this exact sequence: {expected_structure}."
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
            # Direct-Pass cho file nhỏ (≤ 40K ký tự): giới hạn tối đa 30,000 ký tự để đảm bảo an toàn SSL
            knowledge_block = extracted_knowledge[:30000]
            if len(extracted_knowledge) > 30000:
                knowledge_block += "\n...[truncated for context limit]"

        outline_block = ""
        if outline:
            outline_block = f"DOCUMENT STRUCTURE/OUTLINE:\n{outline}\n\n"

        user_content = (
            f"{outline_block}"
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

    # ─── Single-Shot Generation ───────────────────────────────────────────────

    @classmethod
    def generate_single_shot_script(
        cls,
        section_contexts: Dict[str, str],   # {node_type → context string}
        nodes: List[Dict[str, Any]],        # [{node_type, goal}, ...]
        rag_activities: List[str],          # danh sách activities
        classroom_ctx: Dict[str, Any] = None,  # {duration, studentCount, learning_outcome}
        model: str = None,
        temperature: float = 0.4,
        max_tokens: int = 4000,
    ) -> dict:
        """
        Single-Shot: Gộp Map + Enrich thành 1 LLM call duy nhất.
        Trả về: { "success": bool, "content": str (JSON array), ... }
        """
        classroom_ctx = classroom_ctx or {}
        duration = classroom_ctx.get("duration", 45)
        student_count = classroom_ctx.get("studentCount", "11-30")
        learning_outcome = classroom_ctx.get("learning_outcome", "")
        learning_space = classroom_ctx.get("learningSpace", "")
        seating = classroom_ctx.get("seatingArrangement", "")
        infra = classroom_ctx.get("classroomInfra", [])
        devices = classroom_ctx.get("studentDevice", [])

        # Human-readable mappings
        SPACE_LABELS = {
            "classroom": "Lớp học truyền thống",
            "lab": "Phòng lab / máy tính",
            "outdoor": "Ngoài trời",
            "online": "Học trực tuyến (Online)",
        }
        SEATING_LABELS = {
            "rows": "Hàng dọc (truyền thống)",
            "groups": "Nhóm bàn (thảo luận)",
            "u-shape": "Chữ U",
            "flexible": "Linh hoạt",
        }
        INFRA_LABELS = {
            "wifi": "WiFi mạnh",
            "power": "Ổ điện",
            "display": "Máy chiếu / TV",
            "board": "Bảng viết",
        }
        DEVICE_LABELS = {
            "toolkit": "Toolkit / dụng cụ thực hành",
            "phone": "Điện thoại",
            "laptop": "Laptop",
            "other": "Thiết bị khác",
        }

        space_str = SPACE_LABELS.get(learning_space, learning_space) if learning_space else ""
        seating_str = SEATING_LABELS.get(seating, seating) if seating else ""
        infra_str = ", ".join(INFRA_LABELS.get(i, i) for i in infra) if infra else ""
        device_str = ", ".join(DEVICE_LABELS.get(d, d) for d in devices) if devices else ""

        # Dynamic JSON schema depending on nodes
        node_types_list = [n.get("node_type") for n in nodes if n.get("node_type")]
        unique_types = sorted(list(set(node_types_list))) if node_types_list else ['Khởi động', 'Hình thành kiến thức', 'Luyện tập']
        node_types_str = ", ".join(f"'{nt}'" for nt in unique_types)

        dynamic_schema = f"""{{
  "node_type": "string — MUST be exactly one of: {node_types_str}",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này trong bài học (VD: 'Khái niệm End User và Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm của node này",
  "mapped_knowledge": ["string — Khái niệm/điểm kiến thức 1", "..."],
  "node_content": ["string — Ý chính nội dung giảng dạy chi tiết của node này lấy từ tài liệu gốc. ĐỊNH DẠNG: Sử dụng Markdown rõ ràng (dùng '###' cho tiêu đề phụ, '-' hoặc '1.' cho danh sách dòng liệt kê, '**chữ**' để tô đậm từ khóa). YÊU CẦU: Giữ nguyên 100% các mốc thời gian, số liệu thô, thuật ngữ kỹ thuật, tên riêng. Độ chính xác thông tin phải đạt trên 90% so với bản gốc."],
  "applied_activity": "string — Tên hoạt động dạy học được chọn hoặc adapt phù hợp",
  "execution_steps": ["string — Bước thực hiện chi tiết (step-by-step cho GV và HS) để tổ chức hoạt động"],
  "estimated_time_minutes": "number — Thời gian ước tính (phút)",
  "materials_needed": ["string — Đồ dùng, học liệu cần chuẩn bị"]
}}"""

        num_nodes = len(nodes)
        expected_structure = " -> ".join(f"'{n.get('node_type')}'" for n in nodes)

        system_prompt = (
            "Bạn là AI Sư phạm chuyên nghiệp, thiết kế kịch bản giảng dạy và giáo án bám sát thực tế lớp học.\n"
            f"Nhiệm vụ: Tạo TOÀN BỘ kịch bản giảng dạy cho {num_nodes} node trong template theo thứ tự: {expected_structure}.\n\n"
            "CRITICAL RULES:\n"
            "1. node_type trong mỗi object của array PHẢI KHỚP CHÍNH XÁC theo template — không được tự ý sửa hay dịch lại tên node.\n"
            "2. node_content: Sử dụng định dạng Markdown (tiêu đề phụ '###', danh sách '-', '**chữ**' to bold). Giữ nguyên 100% số liệu, ngày tháng, tên riêng, thuật ngữ kỹ thuật từ tài liệu gốc.\n"
            "3. applied_activity: Chọn hoạt động từ danh sách gợi ý hoặc tự thiết kế sáng tạo sao cho phù hợp nhất với nội dung và thời lượng.\n"
            "4. Đảm bảo tổng thời lượng (estimated_time_minutes của các node cộng lại) phù hợp với thời lượng yêu cầu của bài học.\n"
            "5. Chỉ trả về một JSON array duy nhất chứa các object theo đúng cấu trúc. Không viết thêm lời giới thiệu, lời kết hay bao bọc bởi markdown block.\n\n"
            "Cấu trúc của mỗi object trong JSON array:\n"
            f"{dynamic_schema}"
        )

        # Build context sections block
        contexts_block = ""
        for node in nodes:
            nt = node.get("node_type", "")
            ctx_text = section_contexts.get(nt, "")
            # Truncate context per node if too large to fit context window safely
            truncated_ctx = safe_truncate_context(ctx_text, 3000)
            
            # Tìm danh sách hoạt động gợi ý thích hợp qua RAG cho riêng node này
            node_goal = node.get("goal", "") or node.get("node_intent", "")
            node_activities = retrieve_activities(
                node_type=nt,
                node_intent=node_goal,
                classroom_ctx=classroom_ctx,
                limit=5
            )
            node_activities_hint = "\n".join(f"  * {a}" for a in node_activities)
            
            contexts_block += (
                f"=== CONTEXT FOR NODE '{nt}' ===\n"
                f"MỤC TIÊU SƯ PHẠM: {node_goal}\n"
                f"HOẠT ĐỘNG DẠY HỌC GỢI Ý PHÙ HỢP (RAG):\n{node_activities_hint}\n"
                f"NỘI DUNG TÀI LIỆU GỐC:\n{truncated_ctx}\n\n"
            )

        user_content = (
            f"THÔNG TIN LỚP HỌC (CLASSROOM CONTEXT):\n"
            f"- Thời lượng: {duration} phút\n"
            f"- Sĩ số: {student_count} học sinh\n"
        )
        if space_str:
            user_content += f"- Không gian học: {space_str}\n"
        if seating_str:
            user_content += f"- Bố trí chỗ ngồi: {seating_str}\n"
        if infra_str:
            user_content += f"- Cơ sở vật chất sẵn có: {infra_str}\n"
        if device_str:
            user_content += f"- Thiết bị học sinh mang theo: {device_str}\n"
        if learning_outcome:
            user_content += f"- Mục tiêu bài học (Học sinh có thể): {learning_outcome}\n"

        user_content += (
            f"\nKHUNG BÀI HỌC (TEMPLATE):\n"
            f"{json.dumps(nodes, ensure_ascii=False, indent=2)}\n\n"
            f"CHI TIẾT CONTEXT & HOẠT ĐỘNG PHÙ HỢP THEO TỪNG NODE:\n"
            f"{contexts_block}"
            f"Hãy sinh ra JSON array chứa chính xác {num_nodes} objects tương ứng với các nodes trên."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        return cls.generate_chat_completion(
            messages, model=model, temperature=temperature, max_tokens=max_tokens
        )

    @classmethod
    def review_single_node_from_script(
        cls,
        node: Dict[str, Any],
        script_text: str,
        node_index: int,
        total_nodes: int,
        node_types_str: str,
        model: str = None,
        temperature: float = 0.4,
    ) -> dict:
        """
        Review VÀ format MỘT node cụ thể từ kịch bản sư phạm.
        Dùng để gọi parallel theo từng node, tránh payload quá lớn.

        Args:
            node: { node_type, goal } — định nghĩa node cần review
            script_text: Đoạn text kịch bản sư phạm (đã được truncate)
            node_index: Vị trí của node trong danh sách (0-indexed)
            total_nodes: Tổng số nodes trong template
            node_types_str: Chuỗi liệt kê các node_type hợp lệ
        """
        node_type = node.get("node_type", "")
        node_goal = node.get("goal", "")

        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            f"You are reviewing a lesson plan/pedagogical script (giáo án) and extracting/formatting content for ONE specific node: '{node_type}'.\n\n"
            "CRITICAL RULES:\n"
            f"1. Focus ONLY on extracting activities, steps, and content from the script that belong to the '{node_type}' phase (goal: {node_goal}).\n"
            "2. If the original script already has detailed, step-by-step instructions for this phase → preserve them as-is in 'execution_steps'.\n"
            "3. If the original script is brief or sparse for this phase → expand 'execution_steps' with detailed, practical steps for both teacher and students.\n"
            "4. Preserve 100% of all original timestamps, dates, historical facts, proper names, and figures.\n"
            "5. Write pedagogical review/improvement suggestions in 'context_adaptation'.\n"
            "6. Respond ONLY with a single valid JSON object. No markdown (no ```json), no array, no extra text.\n"
            "7. Format the 'node_content' array using rich markdown (headings with '###', lists with '-' or '1.', bold text with '**') for visual clarity.\n\n"
            "The object MUST follow this exact schema (all fields required):\n"
            "{\n"
            f"  \"node_type\": \"{node_type}\",\n"
            "  \"title\": \"string — Tiêu đề hoạt động từ giáo án gốc tương ứng với phase này\",\n"
            "  \"node_intent\": \"string — Mục tiêu sư phạm của phase này\",\n"
            "  \"mapped_knowledge\": [\"string — Kiến thức/khái niệm được dạy trong phase này\"],\n"
            "  \"node_content\": [\"string — Nội dung lý thuyết/kiến thức cốt lõi của phase này. ĐỊNH DẠNG: Sử dụng Markdown rõ ràng (ví dụ: '###' cho tiêu đề phụ, '-' hoặc '1.' cho danh sách dòng liệt kê, '**chữ**' tô đậm từ khóa)\"],\n"
            "  \"applied_activity\": \"string — Tên/mô tả hoạt động dạy học chính của phase này\",\n"
            "  \"execution_steps\": [\"string — Bước thực hiện chi tiết (step-by-step cho GV và HS)\"],\n"
            "  \"estimated_time_minutes\": 0,\n"
            "  \"materials_needed\": [\"string — Đồ dùng, học liệu cần chuẩn bị\"],\n"
            "  \"context_adaptation\": \"string — Nhận xét sư phạm và đề xuất cải tiến cho HS trung học\"\n"
            "}"
        )

        # Mỗi node chỉ nhận 6000 chars để tránh SSL/timeout
        truncated_script = safe_truncate_context(script_text, 6000)
        if len(script_text) > 6000:
            truncated_script += "\n...[truncated]"

        user_content = (
            f"NODE TO EXTRACT (node {node_index + 1} of {total_nodes}): '{node_type}'\n"
            f"Node pedagogical goal: {node_goal}\n\n"
            f"FULL PEDAGOGICAL SCRIPT / LESSON PLAN:\n"
            f"{truncated_script}\n\n"
            f"Extract and format content for ONLY the '{node_type}' phase from the above script."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        return cls.generate_chat_completion(
            messages, model=model, temperature=temperature, max_tokens=1500
        )

    @classmethod
    def parallel_review_pedagogical_script(
        cls,
        script_text: str,
        nodes: List[Dict[str, Any]],
        model: str = None,
        temperature: float = 0.4,
        max_workers: int = 4,
    ) -> dict:
        """
        Review kịch bản sư phạm SONG SONG, mỗi node gọi LLM riêng.
        Tránh payload lớn → fix SSL/Max-retries errors.

        Returns:
            dict: { "success": bool, "content": list[node], "errors": list }
        """
        if not nodes:
            return {"success": False, "error": "No nodes defined in template."}

        node_types_list = [n.get("node_type") for n in nodes if n.get("node_type")]
        unique_types = sorted(list(set(node_types_list)))
        node_types_str = ", ".join(f"'{nt}'" for nt in unique_types)

        results: List[Optional[dict]] = [None] * len(nodes)
        errors: List[Optional[str]] = [None] * len(nodes)

        app = current_app._get_current_object()

        def _review_task(index: int, node: Dict[str, Any], app_obj) -> tuple:
            with app_obj.app_context():
                result = cls.review_single_node_from_script(
                    node=node,
                    script_text=script_text,
                    node_index=index,
                    total_nodes=len(nodes),
                    node_types_str=node_types_str,
                    model=model,
                    temperature=temperature,
                )
                return index, result

        with ThreadPoolExecutor(max_workers=min(max_workers, len(nodes))) as executor:
            futures = {
                executor.submit(_review_task, i, node, app): i
                for i, node in enumerate(nodes)
            }

            for future in as_completed(futures):
                try:
                    index, result = future.result()
                    if result.get("success"):
                        content_str = result.get("content", "").strip()
                        content_str = re.sub(r'```json|```', '', content_str).strip()
                        try:
                            parsed_node = json.loads(content_str)
                            results[index] = parsed_node
                        except json.JSONDecodeError:
                            results[index] = {"_raw": content_str, "node_type": nodes[index].get("node_type", "")}
                            errors[index] = f"Node {index}: JSON parse error"
                    else:
                        errors[index] = f"Node {index}: {result.get('error', 'Unknown error')}"
                except Exception as e:
                    idx = futures[future]
                    errors[idx] = f"Node {idx}: Thread exception — {str(e)}"

        successful = [r for r in results if r is not None]
        actual_errors = [e for e in errors if e is not None]

        if not successful:
            return {
                "success": False,
                "error": "All node review tasks failed.",
                "errors": actual_errors,
            }

        return {
            "success": True,
            "content": successful,
            "errors": actual_errors if actual_errors else [],
            "partial": len(actual_errors) > 0,
        }

    # ─── Feature 3: Enrich Single Node (dùng cho parallel) ───────────────────

    @classmethod
    def enrich_single_node(
        cls,
        node: Any,
        rag_activities: Any,
        model: str = None,
        temperature: float = 0.5,
        section_context: str = None,
        classroom_ctx: Dict[str, Any] = None,
    ) -> dict:
        """
        Enrich MỘT node duy nhất với hoạt động dạy học phù hợp.
        Dùng để gọi song song qua parallel_enrich_nodes().

        Args:
            node: Object của 1 node đã được map (dict hoặc str JSON)
            rag_activities: Danh sách hoạt động dạy học
            section_context: Optional — context chunk riêng cho node này
            classroom_ctx: Optional — Cấu hình lớp học từ client
            model, temperature: Override params

        Returns:
            dict: { "success": bool, "content": str (enriched node JSON), ... }
        """
        # Parse node if it is a JSON string or dict
        if isinstance(node, str):
            try:
                node_obj = json.loads(node)
            except Exception:
                node_obj = {}
        else:
            node_obj = node or {}

        activities_hint = ""
        if classroom_ctx:
            # Query dynamic activities based on this node's type and intent/goal
            nt = node_obj.get("node_type", node_obj.get("node_name", ""))
            intent = node_obj.get("goal", "") or node_obj.get("node_intent", "")
            node_activities = retrieve_activities(
                node_type=nt,
                node_intent=intent,
                classroom_ctx=classroom_ctx,
                limit=5
            )
            activities_hint = "\n".join(f"- {a}" for a in node_activities)
        elif rag_activities:
            if isinstance(rag_activities, list):
                activities_hint = "\n".join(f"- {a}" for a in rag_activities)
            else:
                activities_hint = str(rag_activities)

        given_node_type = node_obj.get("node_type", node_obj.get("node_name", ""))

        dynamic_enriched_schema = f"""{{
  "node_type": "string — MUST be exactly: '{given_node_type}'",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này (VD: 'Phân tích vai trò End User vs Economic Buyer')",
  "node_intent": "string — Mục tiêu sư phạm",
  "mapped_knowledge": ["string"],
  "node_content": ["string — Nội dung kiến thức giảng dạy tương ứng của node này. ĐỊNH DẠNG: Giữ nguyên định dạng Markdown rõ ràng từ node_content gốc (ví dụ: '###' cho tiêu đề phụ, '-' hoặc '1.' cho danh sách dòng liệt kê, '**chữ**' tô đậm từ khóa) và bảo toàn 100% các mốc thời gian, số liệu thô, thuật ngữ kỹ thuật."],
  "applied_activity": "string — Tên hoạt động dạy học được chọn từ RAG",
  "execution_steps": ["string — Bước thực hiện chi tiết 1", "..."],
  "estimated_time_minutes": "number — Thời gian ước tính (phút)",
  "materials_needed": ["string — Vật liệu/công cụ cần thiết"]
}}"""

        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            "For the given lesson node, select and adapt the MOST SUITABLE teaching activity. "
            "The activity must align with the node's intent and knowledge content.\n\n"
            "CRITICAL RULES:\n"
            "1. Use ONLY information from the provided text. Do NOT introduce ungrounded facts or change any timeline milestones.\n"
            "2. Preserve 100% of all original timestamps, dates, metrics, and key terms in the 'node_content'. Do NOT paraphrase them or alter their values.\n"
            "3. Prioritize using the activities from the provided list if they match the content. Adapt them. "
            "If no activity from the list fits the pedagogical purpose, you may propose a custom, more appropriate activity.\n"
            "4. Execution steps must be specific, actionable, and practical for a classroom.\n"
            "5. Keep and pass through the 'node_content' array from the input node exactly into your response, maintaining all Markdown structure and styles. If you generate or modify it, format it using rich markdown (headings with '###', lists with '-' or '1.', bold text with '**') for visual clarity.\n"
            f"6. The 'node_type' in your response MUST be exactly the same as the input node's 'node_type': '{given_node_type}'. Do NOT change or rename it.\n"
            "7. Respond ONLY with a single valid JSON object. No markdown, no array, no extra text.\n\n"
            "The object MUST follow this exact schema:\n"
            f"{dynamic_enriched_schema}"
        )

        node_str = json.dumps(node, ensure_ascii=False) if isinstance(node, dict) else str(node)

        context_block = ""
        if section_context:
            truncated = safe_truncate_context(section_context, 4000)  # Giữ nhỏ: enrich chỉ cần đủ context để chọn activity
            context_block = (
                f"\nSOURCE CONTEXT (relevant document excerpts for this node):\n"
                f"{truncated}\n"
            )

        user_content = (
            f"LESSON NODE TO ENRICH:\n{node_str}\n"
            f"{context_block}\n"
            f"AVAILABLE TEACHING ACTIVITIES:\n{activities_hint}\n\n"
            "Please select the best activity or adapt/propose one as instructed, then return the JSON object."
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
        classroom_ctx: Dict[str, Any] = None,
    ) -> dict:
        """
        Enrich toàn bộ nodes TUẦN TỰ (backward-compatible với routes cũ).
        Dùng parallel_enrich_nodes() nếu muốn tối ưu performance.
        """
        if classroom_ctx:
            # Parse mapped_nodes if it's a JSON string
            nodes_list = mapped_nodes
            if isinstance(nodes_list, str):
                try:
                    nodes_list = json.loads(nodes_list)
                except Exception:
                    nodes_list = []
            if not isinstance(nodes_list, list):
                nodes_list = [nodes_list]

            retrieved = []
            for node in nodes_list:
                if isinstance(node, dict):
                    nt = node.get("node_type", node.get("node_name", ""))
                    intent = node.get("goal", "") or node.get("node_intent", "")
                    retrieved.extend(retrieve_activities(nt, intent, classroom_ctx, limit=3))
            
            if retrieved:
                rag_activities = list(dict.fromkeys(retrieved))

        system_prompt = (
            "You are an Expert Pedagogical Architect AI.\n"
            "For every mapped node, select and adapt the most sensible activity from the provided list "
            "that bridges the node's intent with the assigned core content.\n\n"
            "CRITICAL RULES:\n"
            "1. Use ONLY activities from the provided list.\n"
            "2. Keep and pass through the 'node_content' array from each input node exactly into your response objects.\n"
            "3. Keep the exact 'node_type' of each input node in your response objects. Do NOT change them.\n"
            "4. Respond ONLY with a valid JSON array of objects. No markdown, no extra text.\n\n"
            "Each object in the array MUST follow the structure of this schema (but keep its respective input 'node_type'):\n"
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
        classroom_ctx: Dict[str, Any] = None,
        max_workers: int = 3,
    ) -> dict:
        """
        Enrich toàn bộ nodes SONG SONG dùng ThreadPoolExecutor.
        Tổng thời gian ≈ thời gian của node chậm nhất (không phải tổng tất cả).

        Args:
            nodes: List các node objects đã được map
            rag_activities: Danh sách hoạt động dạy học
            section_contexts: { node_name → context } từ chunking_service (optional)
            classroom_ctx: Optional — Cấu hình lớp học từ client
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
                    classroom_ctx=classroom_ctx,
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
                            # Force override node_type to match the mapped input exactly
                            original_node = nodes[index]
                            if isinstance(original_node, dict) and isinstance(parsed_node, dict):
                                orig_type = original_node.get("node_type") or original_node.get("node_name") or original_node.get("type")
                                if orig_type:
                                    parsed_node["node_type"] = orig_type
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
