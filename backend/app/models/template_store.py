"""
template_store.py — In-memory store cho LessonTemplate entities.

Giai đoạn 1: Lưu trong dict, không cần DB.
Giai đoạn 2 (sau): Swap class này sang SQLAlchemy model mà không cần đổi route.
"""

from datetime import datetime, timezone
from typing import Optional

# ─── Mock Data ────────────────────────────────────────────────────────────────

_MOCK_TEMPLATES = [
    {
        "id": "compact-2-node",
        "name": "Buổi học ngắn",
        "description": "Phù hợp với các buổi học ngắn (30–45 phút). Tập trung vào 1 hoạt động khởi động và 1 phần thực hành nhanh.",
        "tags": ["ngắn", "thực hành", "30-45p"],
        "suitable_for": {
            "duration_min": 30,
            "duration_max": 45,
            "bloom_levels": ["NB", "TH"],
            "student_count_min": 5,
            "student_count_max": 60,
        },
        "nodes": [
            {
                "node_type": "Khởi động",
                "goal": "Kích hoạt kiến thức nền và tạo hứng thú",
                "suggested_duration_pct": 0.35,
            },
            {
                "node_type": "Thực hành & Vận dụng",
                "goal": "Học sinh áp dụng kiến thức vào bài tập thực tế",
                "suggested_duration_pct": 0.65,
            },
        ],
        "rag_activities": [
            "Trò chơi Kahoot câu hỏi trắc nghiệm ôn tập nhanh (5–7 phút)",
            "Thẻ câu hỏi xoay vòng (Quiz Cards)",
            "Bài tập cá nhân tốc độ (Quick Solo Task)",
        ],
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "standard-3-node",
        "name": "Khung 3 phần chuẩn",
        "description": "Template phổ biến nhất. Cân bằng giữa lý thuyết và thực hành, phù hợp hầu hết các buổi học 60–90 phút.",
        "tags": ["chuẩn", "cân bằng", "60-90p"],
        "suitable_for": {
            "duration_min": 46,
            "duration_max": 90,
            "bloom_levels": ["NB", "TH", "VD"],
            "student_count_min": 5,
            "student_count_max": 60,
        },
        "nodes": [
            {
                "node_type": "Khởi động",
                "goal": "Kích hoạt kiến thức nền của học sinh",
                "suggested_duration_pct": 0.20,
            },
            {
                "node_type": "Lý thuyết cốt lõi",
                "goal": "Giới thiệu và giải thích nội dung chính",
                "suggested_duration_pct": 0.45,
            },
            {
                "node_type": "Thực hành & Vận dụng",
                "goal": "Học sinh áp dụng kiến thức vào bài tập",
                "suggested_duration_pct": 0.35,
            },
        ],
        "rag_activities": [
            "Trò chơi Kahoot câu hỏi trắc nghiệm ôn tập nhanh (5–7 phút)",
            "Thảo luận nhóm tranh biện (Think-Pair-Share)",
            "Sơ đồ tư duy tiếp sức theo nhóm (Mind Map Relay)",
            "Nhập vai xử lý tình huống thực tế (Role Play)",
        ],
        "created_at": "2026-01-01T00:00:00Z",
    },
    {
        "id": "extended-4-node",
        "name": "Buổi học chuyên sâu",
        "description": "Dành cho buổi học dài (91–180 phút) hoặc yêu cầu phân tích sâu. Bổ sung node Tổng kết để củng cố kiến thức.",
        "tags": ["chuyên sâu", "phân tích", "90-180p"],
        "suitable_for": {
            "duration_min": 91,
            "duration_max": 180,
            "bloom_levels": ["VD", "PT"],
            "student_count_min": 5,
            "student_count_max": 60,
        },
        "nodes": [
            {
                "node_type": "Khởi động",
                "goal": "Kích hoạt kiến thức nền và tình huống dẫn nhập",
                "suggested_duration_pct": 0.15,
            },
            {
                "node_type": "Lý thuyết cốt lõi",
                "goal": "Giới thiệu và phân tích sâu nội dung chính",
                "suggested_duration_pct": 0.35,
            },
            {
                "node_type": "Thực hành & Vận dụng",
                "goal": "Học sinh áp dụng và phân tích tình huống thực tế",
                "suggested_duration_pct": 0.35,
            },
            {
                "node_type": "Tổng kết",
                "goal": "Củng cố kiến thức, rút kinh nghiệm và định hướng tiếp theo",
                "suggested_duration_pct": 0.15,
            },
        ],
        "rag_activities": [
            "Sơ đồ tư duy tiếp sức theo nhóm (Mind Map Relay)",
            "Nhập vai xử lý tình huống thực tế (Role Play)",
            "Thí nghiệm hoặc mô phỏng thực hành có hướng dẫn",
            "Thảo luận nhóm tranh biện (Think-Pair-Share)",
            "Phân tích case study theo nhóm",
        ],
        "created_at": "2026-01-01T00:00:00Z",
    },
]


# ─── Store ────────────────────────────────────────────────────────────────────

class TemplateStore:
    """
    In-memory store cho LessonTemplate.
    Interface thiết kế để swap sang DB (SQLAlchemy) sau mà không cần đổi routes.
    """

    _data: dict = {t["id"]: t for t in _MOCK_TEMPLATES}

    # ── Read ──────────────────────────────────────────────────────────────────

    @classmethod
    def get_all(cls, filters: Optional[dict] = None) -> list:
        """
        Trả về tất cả templates, có thể filter theo:
          - duration (int): lọc các template có duration_min <= duration <= duration_max
          - bloom (str): lọc theo bloom level (VD: "VD")
          - student_count (int): lọc theo suitable student count
        """
        results = list(cls._data.values())

        if not filters:
            return results

        duration = filters.get("duration")
        bloom = filters.get("bloom")
        student_count = filters.get("student_count")

        filtered = []
        for t in results:
            sf = t.get("suitable_for", {})

            if duration is not None:
                if not (sf.get("duration_min", 0) <= duration <= sf.get("duration_max", 9999)):
                    continue

            if bloom is not None:
                if bloom not in sf.get("bloom_levels", []):
                    continue

            if student_count is not None:
                if not (sf.get("student_count_min", 0) <= student_count <= sf.get("student_count_max", 9999)):
                    continue

            filtered.append(t)

        return filtered

    @classmethod
    def get_by_id(cls, template_id: str) -> Optional[dict]:
        return cls._data.get(template_id)

    # ── Write ─────────────────────────────────────────────────────────────────

    @classmethod
    def create(cls, data: dict) -> dict:
        template_id = data.get("id") or _slugify(data.get("name", "template"))
        # Ensure unique ID
        base = template_id
        counter = 1
        while template_id in cls._data:
            template_id = f"{base}-{counter}"
            counter += 1

        data["id"] = template_id
        data["created_at"] = datetime.now(timezone.utc).isoformat()
        cls._data[template_id] = data
        return data

    @classmethod
    def update(cls, template_id: str, data: dict) -> Optional[dict]:
        if template_id not in cls._data:
            return None
        existing = cls._data[template_id]
        existing.update(data)
        existing["id"] = template_id  # Prevent ID override
        cls._data[template_id] = existing
        return existing

    @classmethod
    def delete(cls, template_id: str) -> bool:
        if template_id not in cls._data:
            return False
        del cls._data[template_id]
        return True

    # ── Helpers ───────────────────────────────────────────────────────────────

    @classmethod
    def build_system_template_string(cls, template: dict) -> str:
        """
        Chuyển template object → system_template string để truyền vào AI pipeline.
        Format: "Node 1 — node_type: X | Mục tiêu: Y\n..."
        """
        lines = [f"Khung bài học {len(template['nodes'])} node:"]
        for i, node in enumerate(template["nodes"], 1):
            lines.append(
                f"Node {i} — node_type: '{node['node_type']}' | Mục tiêu: {node['goal']}"
            )
        lines.append(
            "\nQUY TẮC: Trường 'title' phải là tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ "
            "của node này trong bài học (ĐỪNG thêm vào 'node_type')."
        )
        return "\n".join(lines)


def _slugify(text: str) -> str:
    import re
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")
