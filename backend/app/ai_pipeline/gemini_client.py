"""
gemini_client.py — Service giao tiếp với API Beeknoee (Gemini-3.5-flash)

Đã rút gọn tối đa, chỉ giữ lại các luồng xử lý thực tế:
1. generate_chat_completion() — Trò chuyện / Chat cơ bản
2. generate_single_shot_script() — Sinh giáo án bằng phương pháp Single-Shot (1 call duy nhất)
"""

import json
import re
from typing import Dict, Any, List
from flask import current_app
from app.ai_pipeline.activity_pool import retrieve_activities

MAX_CONTEXT_CHARS = 6000  # Giới hạn context ~2000 tokens để tối ưu hóa chi phí/tốc độ


def safe_truncate_context(context: str, max_chars: int = MAX_CONTEXT_CHARS) -> str:
    """Cắt context tại ranh giới các chunk thay vì cắt giữa chừng dòng."""
    if not context or len(context) <= max_chars:
        return context or ""
    parts = context.split("\n\n---\n\n")
    result = ""
    for part in parts:
        if len(result) + len(part) + (4 if result else 0) > max_chars:
            break
        result = result + "\n\n---\n\n" + part if result else part
    return result.strip()


class GeminiService:

    # ─── Chat Completion Cơ Bản ──────────────────────────────────────────────

    @classmethod
    def generate_chat_completion(
        cls,
        messages: list,
        model: str = None,
        temperature: float = 0.7,
        max_tokens: int = 1000,
    ) -> dict:
        import requests
        
        selected_model = model or current_app.config.get("GEMINI_MODEL", "gemini-3.5-flash")
        api_key = current_app.config.get("GEMINI_API_KEY")
        if not api_key:
            return {"success": False, "error": "GEMINI_API_KEY is not set."}

        url = "https://platform.beeknoee.com/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": selected_model,
            "messages": messages,
            "max_tokens": max_tokens
        }
        if temperature is not None:
            payload["temperature"] = temperature

        try:
            response = requests.post(url, headers=headers, json=payload, timeout=300)
            if not response.ok:
                return {"success": False, "error": f"API error: HTTP {response.status_code} - {response.text}"}
            
            res_data = response.json()
            choices = res_data.get("choices", [])
            content_text = choices[0].get("message", {}).get("content", "") if choices else ""
            
            if not content_text:
                print(f"[GeminiService] Warning: API returned empty content. Full response: {res_data}")
                return {
                    "success": False, 
                    "error": f"API returned empty content. Full Response: {res_data}"
                }
                
            usage = res_data.get("usage", {})

            return {
                "success": True,
                "content": content_text,
                "model": selected_model,
                "usage": {
                    "prompt_tokens": usage.get("prompt_tokens", 0),
                    "completion_tokens": usage.get("completion_tokens", 0),
                    "total_tokens": usage.get("total_tokens", 0)
                }
            }
        except Exception as err:
            return {"success": False, "error": f"API request failed: {str(err)}"}

    # ─── Single-Shot Generation (Gộp Map + Enrich) ──────────────────────────

    @classmethod
    def generate_single_shot_script(
        cls,
        section_contexts: Dict[str, str],
        nodes: List[Dict[str, Any]],
        rag_activities: List[str],
        classroom_ctx: Dict[str, Any] = None,
        model: str = None,
        temperature: float = 0.4,
        max_tokens: int = 8000,
        key_facts_anchor: str = "",
    ) -> dict:
        classroom_ctx = classroom_ctx or {}
        duration = classroom_ctx.get("duration", 45)
        student_count = classroom_ctx.get("studentCount", "11-30")
        learning_outcome = classroom_ctx.get("learning_outcome", "")
        learning_space = classroom_ctx.get("learningSpace", "")
        seating = classroom_ctx.get("seatingArrangement", "")
        infra = classroom_ctx.get("classroomInfra", [])
        devices = classroom_ctx.get("studentDevice", [])

        # Format nhãn hiển thị cho ngữ cảnh lớp học
        SPACE_LABELS = {"classroom": "Lớp học truyền thống", "lab": "Phòng lab/máy tính", "outdoor": "Ngoài trời", "online": "Học trực tuyến"}
        SEATING_LABELS = {"rows": "Hàng dọc (truyền thống)", "groups": "Nhóm bàn (thảo luận)", "u-shape": "Chữ U", "flexible": "Linh hoạt"}
        INFRA_LABELS = {"wifi": "WiFi mạnh", "power": "Ổ điện", "display": "Máy chiếu/TV", "board": "Bảng viết"}
        DEVICE_LABELS = {"toolkit": "Toolkit/dụng cụ", "phone": "Điện thoại", "laptop": "Laptop", "other": "Thiết bị khác"}

        space_str = SPACE_LABELS.get(learning_space, learning_space) if learning_space else ""
        seating_str = SEATING_LABELS.get(seating, seating) if seating else ""
        infra_str = ", ".join(INFRA_LABELS.get(i, i) for i in infra) if infra else ""
        device_str = ", ".join(DEVICE_LABELS.get(d, d) for d in devices) if devices else ""

        node_types_list = [n.get("node_type") for n in nodes if n.get("node_type")]
        unique_types = sorted(set(node_types_list)) if node_types_list else ["Khởi động", "Hình thành kiến thức", "Luyện tập"]
        node_types_str = ", ".join(f"'{nt}'" for nt in unique_types)

        dynamic_schema = f"""{{
  "node_type": "string — Bắt buộc phải là một trong: {node_types_str}",
  "title": "string — Tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ",
  "node_intent": "string — Mục tiêu sư phạm",
  "mapped_knowledge": ["string"],
  "node_content": ["string — Nội dung Markdown chi tiết, giữ nguyên 100% số liệu"],
  "applied_activity": "string — Tên hoạt động dạy học",
  "execution_steps": ["string — Bước thực hiện chi tiết (step-by-step cho GV và HS)"],
  "estimated_time_minutes": "number — Thời gian ước tính (phút)",
  "materials_needed": ["string — Đồ dùng, học liệu cần chuẩn bị"]
}}"""

        num_nodes = len(nodes)
        expected_structure = " -> ".join(f"'{n.get('node_type')}'" for n in nodes)

        system_prompt = (
            "Bạn là AI Sư phạm chuyên nghiệp, thiết kế kịch bản giảng dạy bám sát thực tế lớp học.\n"
            f"Nhiệm vụ: Tạo TOÀN BỘ kịch bản giảng dạy cho {num_nodes} node theo thứ tự: {expected_structure}.\n\n"
            "CRITICAL RULES:\n"
            "1. node_type trong mỗi object PHẢI KHỚP CHÍNH XÁC theo template — không tự sửa hay dịch tên node.\n"
            "2. node_content: Dùng Markdown ('###' tiêu đề phụ, '-' danh sách, '**chữ**' bold). Giữ nguyên 100% số liệu, ngày tháng, tên riêng.\n"
            "3. applied_activity: Chọn từ danh sách gợi ý hoặc thiết kế sáng tạo phù hợp nội dung.\n"
            "4. Tổng thời lượng (estimated_time_minutes của các node cộng lại) phải phù hợp với thời lượng yêu cầu.\n"
            "5. Chỉ trả về một JSON array duy nhất. Không viết thêm lời giới thiệu hay markdown block.\n"
            "6. THÍCH ỨNG BỐI CẢNH LỚP HỌC (THÔNG TIN LỚP HỌC):\n"
            "   - Nếu học sinh KHÔNG có thiết bị (không có phone/laptop): Tuyệt đối KHÔNG thiết kế các hoạt động yêu cầu công nghệ (như Kahoot, Padlet, quét QR, làm bài trên mạng).\n"
            "   - Nếu cơ sở vật chất KHÔNG có wifi hoặc máy chiếu: Chỉ sử dụng các hoạt động dùng bảng viết hoặc tài liệu giấy phát tay.\n"
            "   - Bố trí chỗ ngồi 'Hàng dọc' (rows) giới hạn việc di chuyển mạnh: Ưu tiên hoạt động cá nhân, cặp đôi tại chỗ, tránh triển lãm di động (Gallery Walk) hoặc các trò chơi vận động chạy nhảy.\n"
            "   - Các bước thực hiện (execution_steps) và học liệu cần chuẩn bị (materials_needed) phải hoàn toàn tương thích và khả thi với mô tả bối cảnh vật chất, thời lượng và số lượng học sinh.\n"
            "7. VIẾT CÔ ĐỌNG, SÚC TÍCH: Tập trung mô tả các bước thực hành cốt lõi, tránh viết dài dòng lê thê không cần thiết để tối ưu hóa tốc độ xử lý và ngăn chặn timeout mạng.\n\n"
            "Cấu trúc mỗi object trong JSON array:\n"
            f"{dynamic_schema}"
        )

        # 2. Ngân sách ký tự động mở rộng theo số node
        limit_per_node = max(4000, 18000 // num_nodes)
        print(f"[GeminiService] Calculated dynamic context limit per node: {limit_per_node} chars")

        contexts_block = ""
        # 1. Nối Key Facts Anchor vào prompt
        if key_facts_anchor:
            contexts_block += f"=== KEY FACTS (MỐC THỜI GIAN & SỰ KIỆN LỊCH SỬ TỪ TÀI LIỆU GỐC) ===\n{key_facts_anchor}\n\n"

        for node in nodes:
            nt = node.get("node_type", "")
            ctx_text = section_contexts.get(nt, "")
            truncated_ctx = safe_truncate_context(ctx_text, limit_per_node)
            
            # Log size thực tế (Priority 7)
            print(f"[GeminiService] Node '{nt}': original context size = {len(ctx_text)}, truncated = {len(truncated_ctx)} chars")

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
                f"HOẠT ĐỘNG DẠY HỌC GỢI Ý (RAG):\n{node_activities_hint}\n"
                f"NỘI DUNG TÀI LIỆU GỐC:\n{truncated_ctx}\n\n"
            )

        user_content = (
            f"THÔNG TIN LỚP HỌC:\n"
            f"- Thời lượng: {duration} phút\n"
            f"- Sĩ số: {student_count} học sinh\n"
        )
        if space_str:    user_content += f"- Không gian học: {space_str}\n"
        if seating_str:  user_content += f"- Bố trí chỗ ngồi: {seating_str}\n"
        if infra_str:    user_content += f"- Cơ sở vật chất: {infra_str}\n"
        if device_str:   user_content += f"- Thiết bị học sinh: {device_str}\n"
        if learning_outcome: user_content += f"- Mục tiêu bài học: {learning_outcome}\n"

        user_content += (
            f"\nKHUNG BÀI HỌC (TEMPLATE):\n"
            f"{json.dumps(nodes, ensure_ascii=False, indent=2)}\n\n"
            f"CHI TIẾT CONTEXT & HOẠT ĐỘNG THEO TỪNG NODE:\n"
            f"{contexts_block}"
            f"Hãy sinh ra JSON array chứa chính xác {num_nodes} objects tương ứng."
        )

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_content},
        ]

        # Log total prompt sizes
        total_prompt_len = len(system_prompt) + len(user_content)
        print(f"[GeminiService] Total prompt size sent to API: {total_prompt_len} chars")

        return cls.generate_chat_completion(
            messages, model=model, temperature=temperature, max_tokens=max_tokens
        )
