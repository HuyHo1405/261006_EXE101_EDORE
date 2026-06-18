"""
activity_pool.py — Cơ sở dữ liệu và thuật toán RAG cho hoạt động dạy học
"""

from typing import List, Dict, Any

ACTIVITIES_POOL: List[Dict[str, Any]] = [
    {
        "id": "kahoot_quiz",
        "name": "Trò chơi trắc nghiệm nhanh (Kahoot/Quizizz)",
        "description": "Học sinh sử dụng thiết bị cá nhân để trả lời câu hỏi trắc nghiệm trực tuyến dưới dạng trò chơi đua điểm số.",
        "suitable_nodes": ["Khởi động", "Luyện tập", "Tổng kết"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": ["phone", "laptop"],
        "required_infra": ["wifi", "display"],
        "group_size": "cá nhân",
        "min_duration": 5,
        "max_duration": 15,
        "bloom_levels": ["NB", "TH"],
        "keywords": ["trắc nghiệm", "kahoot", "quizizz", "game", "trò chơi", "ôn tập", "nhanh", "hứng thú", "thi đấu"]
    },
    {
        "id": "think_pair_share",
        "name": "Thảo luận đôi (Think - Pair - Share)",
        "description": "Học sinh suy nghĩ cá nhân, trao đổi cặp đôi bên cạnh, sau đó đại diện chia sẻ trước tập thể.",
        "suitable_nodes": ["Khởi động", "Hình thành kiến thức", "Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "lab", "outdoor", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cặp đôi",
        "min_duration": 5,
        "max_duration": 15,
        "bloom_levels": ["NB", "TH", "VD"],
        "keywords": ["thảo luận", "cặp", "đôi", "chia sẻ", "suy nghĩ", "tranh luận", "phản biện"]
    },
    {
        "id": "mind_map_relay",
        "name": "Sơ đồ tư duy tiếp sức (Mind Map Relay)",
        "description": "Các nhóm di chuyển luân phiên lên bảng hoặc vẽ chung trên một trang giấy lớn/bảng nhóm để xây dựng sơ đồ tư duy.",
        "suitable_nodes": ["Luyện tập", "Vận dụng", "Tổng kết"],
        "suitable_spaces": ["classroom", "outdoor"],
        "required_devices": [],
        "required_infra": ["board"],
        "group_size": "nhóm nhỏ",
        "min_duration": 10,
        "max_duration": 25,
        "bloom_levels": ["TH", "VD"],
        "keywords": ["sơ đồ tư duy", "mindmap", "tổng hợp", "tiếp sức", "bảng", "hệ thống hóa", "vẽ", "nhóm"]
    },
    {
        "id": "role_play",
        "name": "Đóng vai xử lý tình huống (Role Play)",
        "description": "Học sinh nhập vai các nhân vật giả định (ví dụ: người mua, người bán, kỹ sư, nhà đầu tư) để giải quyết tình huống thực tế.",
        "suitable_nodes": ["Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "outdoor", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 15,
        "max_duration": 40,
        "bloom_levels": ["VD", "VDC"],
        "keywords": ["nhập vai", "đóng vai", "role play", "tình huống", "khách hàng", "giao tiếp", "thuyết phục", "giải quyết vấn đề"]
    },
    {
        "id": "guided_experiment",
        "name": "Thí nghiệm / Mô phỏng có hướng dẫn",
        "description": "Học sinh thực hiện thao tác trực tiếp trên dụng cụ thí nghiệm, phần mềm giả lập hoặc bộ công cụ thực hành dưới sự hướng dẫn.",
        "suitable_nodes": ["Hình thành kiến thức", "Luyện tập"],
        "suitable_spaces": ["classroom", "lab", "outdoor"],
        "required_devices": ["toolkit"],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 15,
        "max_duration": 45,
        "bloom_levels": ["TH", "VD"],
        "keywords": ["thí nghiệm", "mô phỏng", "thao tác", "thực hành", "dụng cụ", "lắp ráp", "trực quan", "vật lý"]
    },
    {
        "id": "jigsaw",
        "name": "Kỹ thuật mảnh ghép (Jigsaw)",
        "description": "Học sinh học theo nhóm chuyên gia để nắm rõ một phần kiến thức, sau đó quay lại nhóm mảnh ghép để chia sẻ toàn bộ bài học.",
        "suitable_nodes": ["Hình thành kiến thức", "Luyện tập"],
        "suitable_spaces": ["classroom", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 20,
        "max_duration": 45,
        "bloom_levels": ["TH", "VD"],
        "keywords": ["mảnh ghép", "jigsaw", "chuyên gia", "hợp tác", "chia sẻ", "nhóm", "tự học"]
    },
    {
        "id": "gallery_walk",
        "name": "Triển lãm tranh (Gallery Walk)",
        "description": "Các nhóm trưng bày sản phẩm học tập lên tường/bàn, học sinh di chuyển xung quanh để tham quan, đánh giá và ghi nhận xét.",
        "suitable_nodes": ["Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "outdoor"],
        "required_devices": [],
        "required_infra": ["board"],
        "group_size": "nhóm nhỏ",
        "min_duration": 15,
        "max_duration": 30,
        "bloom_levels": ["VD", "VDC"],
        "keywords": ["triển lãm", "gallery walk", "trưng bày", "đánh giá chéo", "sản phẩm", "nhận xét", "di chuyển"]
    },
    {
        "id": "kwl_chart",
        "name": "Bảng KWL (Biết - Muốn biết - Đã học)",
        "description": "Điền cột K (đã biết) và W (muốn học) lúc mở đầu, sau đó tổng kết cột L (đã học được gì) vào cuối tiết học.",
        "suitable_nodes": ["Khởi động", "Tổng kết"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cá nhân",
        "min_duration": 5,
        "max_duration": 10,
        "bloom_levels": ["NB", "TH"],
        "keywords": ["kwl", "bảng", "tự đánh giá", "liên hệ", "đã biết", "muốn biết", "tổng kết"]
    },
    {
        "id": "fishbowl",
        "name": "Thảo luận bể cá (Fishbowl)",
        "description": "Một nhóm nhỏ ngồi vòng trong thảo luận chủ đề, nhóm lớn hơn ngồi vòng ngoài quan sát, ghi chép và có thể xin đổi chỗ để tham gia thảo luận.",
        "suitable_nodes": ["Hình thành kiến thức", "Luyện tập"],
        "suitable_spaces": ["classroom", "outdoor"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 15,
        "max_duration": 30,
        "bloom_levels": ["TH", "VD", "VDC"],
        "keywords": ["bể cá", "fishbowl", "thảo luận sâu", "quan sát", "tranh biện", "lắng nghe", "tập trung"]
    },
    {
        "id": "quick_debate",
        "name": "Tranh luận nhanh (Quick Debate)",
        "description": "Chia lớp thành 2 phe ủng hộ và phản đối về một nhận định cụ thể. Mỗi bên cử đại diện đưa ra lập luận luân phiên trong 2 phút.",
        "suitable_nodes": ["Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "outdoor", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "toàn lớp",
        "min_duration": 10,
        "max_duration": 20,
        "bloom_levels": ["VD", "VDC"],
        "keywords": ["tranh luận", "debate", "đối lập", "tư duy phản biện", "lập luận", "ý kiến", "bảo vệ"]
    },
    {
        "id": "learning_stations",
        "name": "Trạm học tập (Learning Stations)",
        "description": "Xây dựng các trạm nhiệm vụ khác nhau quanh phòng học. Các nhóm luân chuyển qua từng trạm để hoàn thành nhiệm vụ theo giới hạn thời gian.",
        "suitable_nodes": ["Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "lab"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 20,
        "max_duration": 50,
        "bloom_levels": ["TH", "VD", "VDC"],
        "keywords": ["trạm", "stations", "luân chuyển", "nhiệm vụ", "đa dạng", "chủ động", "di chuyển"]
    },
    {
        "id": "exit_ticket",
        "name": "Phiếu xuất phòng (Exit Ticket / 3-2-1)",
        "description": "Trước khi rời lớp, học sinh viết nhanh: 3 điều tâm đắc, 2 điều muốn tìm hiểu thêm, 1 câu hỏi còn thắc mắc lên phiếu nộp cho giáo viên.",
        "suitable_nodes": ["Tổng kết"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cá nhân",
        "min_duration": 3,
        "max_duration": 7,
        "bloom_levels": ["TH"],
        "keywords": ["tổng kết", "exit ticket", "phản hồi", "thu hoạch", "nhanh", "cuối giờ"]
    },
    {
        "id": "brainwriting",
        "name": "Chắp vá ý kiến viết nhanh (Brainwriting)",
        "description": "Viết ý tưởng lên giấy rồi chuyển cho người bên cạnh bổ sung, lặp lại liên tục để thu thập lượng lớn ý tưởng sáng tạo trong thời gian ngắn.",
        "suitable_nodes": ["Khởi động", "Vận dụng"],
        "suitable_spaces": ["classroom"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 8,
        "max_duration": 15,
        "bloom_levels": ["VD", "VDC"],
        "keywords": ["brainwriting", "ý tưởng", "viết nhanh", "chuyển giấy", "sáng tạo", "động não", "yên lặng"]
    },
    {
        "id": "brainstorming",
        "name": "Động não tự do (Brainstorming)",
        "description": "Mọi học sinh tự do đưa ra ý kiến, ý tưởng về một vấn đề mà không bị phán xét, giáo viên ghi nhận nhanh toàn bộ lên bảng.",
        "suitable_nodes": ["Khởi động"],
        "suitable_spaces": ["classroom", "lab", "outdoor", "online"],
        "required_devices": [],
        "required_infra": ["board"],
        "group_size": "toàn lớp",
        "min_duration": 5,
        "max_duration": 10,
        "bloom_levels": ["NB", "TH"],
        "keywords": ["brainstorm", "động não", "khơi gợi", "ý kiến", "thu thập", "tự do", "kích hoạt"]
    },
    {
        "id": "quiz_cards",
        "name": "Thẻ câu hỏi xoay vòng (Quiz Cards)",
        "description": "Sử dụng các thẻ flashcard chứa câu hỏi ôn tập, học sinh hỏi đáp theo cặp hoặc xoay vòng nhóm để tự kiểm tra kiến thức chéo.",
        "suitable_nodes": ["Luyện tập"],
        "suitable_spaces": ["classroom", "lab", "outdoor"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cặp đôi",
        "min_duration": 7,
        "max_duration": 15,
        "bloom_levels": ["NB", "TH"],
        "keywords": ["thẻ câu hỏi", "flashcard", "đố vui", "ôn tập", "hỏi đáp", "nhớ nhanh"]
    },
    {
        "id": "lucky_draw",
        "name": "Bốc thăm may mắn (Lucky Draw / Cold Calling)",
        "description": "Giáo viên gọi tên ngẫu nhiên học sinh trả lời câu hỏi thông qua que tên, vòng quay may mắn hoặc bốc thăm số thứ tự.",
        "suitable_nodes": ["Khởi động", "Luyện tập"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cá nhân",
        "min_duration": 3,
        "max_duration": 8,
        "bloom_levels": ["NB", "TH"],
        "keywords": ["bốc thăm", "gọi tên", "vòng quay", "tập trung", "ngẫu nhiên", "kích thích"]
    },
    {
        "id": "reflective_journal",
        "name": "Nhật ký phản hồi nhanh (Reflective Journaling)",
        "description": "Học sinh tự viết phản hồi ngắn vào vở hoặc ứng dụng ghi chú về bài học: điều khó nhất là gì, liên hệ thực tế bản thân ra sao.",
        "suitable_nodes": ["Tổng kết"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cá nhân",
        "min_duration": 5,
        "max_duration": 10,
        "bloom_levels": ["TH", "VD"],
        "keywords": ["nhật ký", "phản hồi", "tự ngẫm", "reflection", "liên hệ bản thân", "tổng kết"]
    },
    {
        "id": "case_study",
        "name": "Phân tích tình huống thực tiễn (Case Study)",
        "description": "Các nhóm nhận tài liệu mô tả một vấn đề thực tế đã xảy ra, nghiên cứu và thảo luận đưa ra giải pháp tối ưu phù hợp lý thuyết.",
        "suitable_nodes": ["Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 15,
        "max_duration": 35,
        "bloom_levels": ["VD", "VDC"],
        "keywords": ["case study", "tình huống thực tế", "phân tích", "vấn đề", "giải pháp", "đưa giải pháp", "thực tiễn"]
    },
    {
        "id": "devils_advocate",
        "name": "Đóng vai phản biện (Devil's Advocate)",
        "description": "Một học sinh hoặc một nhóm nhận nhiệm vụ liên tục đặt câu hỏi nghi vấn, tìm khe hở trong lập luận của nhóm thuyết trình để đẩy sâu tư duy.",
        "suitable_nodes": ["Luyện tập", "Vận dụng"],
        "suitable_spaces": ["classroom", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "nhóm nhỏ",
        "min_duration": 10,
        "max_duration": 20,
        "bloom_levels": ["VD", "VDC"],
        "keywords": ["phản biện", "devil advocate", "chất vấn", "đặt câu hỏi", "lập luận", "đào sâu"]
    },
    {
        "id": "knowledge_bingo",
        "name": "Trò chơi Bingo kiến thức (Bingo)",
        "description": "Học sinh điền từ khóa bài học vào lưới Bingo 3x3 hoặc 4x4. Giáo viên đọc định nghĩa, học sinh gạch chân từ khóa đúng để tạo hàng ngang/dọc.",
        "suitable_nodes": ["Luyện tập"],
        "suitable_spaces": ["classroom"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cá nhân",
        "min_duration": 8,
        "max_duration": 15,
        "bloom_levels": ["NB", "TH"],
        "keywords": ["bingo", "game", "trò chơi", "từ khóa", "định nghĩa", "ôn tập", "nhận diện"]
    },
    {
        "id": "minute_paper",
        "name": "Viết nhanh trong một phút (Minute Paper)",
        "description": "Học sinh viết nhanh ra giấy nháp câu trả lời cho câu hỏi: 'Khái niệm quan trọng nhất bạn vừa học được là gì?' trong vòng đúng 1 phút.",
        "suitable_nodes": ["Tổng kết"],
        "suitable_spaces": ["classroom", "lab", "online"],
        "required_devices": [],
        "required_infra": [],
        "group_size": "cá nhân",
        "min_duration": 2,
        "max_duration": 5,
        "bloom_levels": ["TH"],
        "keywords": ["viết nhanh", "minute paper", "tóm tắt", "kiểm tra nhanh", "thu hoạch"]
    },
    {
        "id": "digital_whiteboard",
        "name": "Bảng trắng số tương tác (Miro/Padlet/Jamboard)",
        "description": "Học sinh cùng truy cập một đường link bảng trắng số để đính kèm note, bình luận hoặc vẽ sơ đồ chung theo thời gian thực.",
        "suitable_nodes": ["Khởi động", "Hình thành kiến thức", "Luyện tập", "Vận dụng", "Tổng kết"],
        "suitable_spaces": ["online", "lab"],
        "required_devices": ["phone", "laptop"],
        "required_infra": ["wifi"],
        "group_size": "nhóm nhỏ",
        "min_duration": 8,
        "max_duration": 20,
        "bloom_levels": ["TH", "VD"],
        "keywords": ["bảng trắng", "miro", "padlet", "jamboard", "tương tác số", "online", "nhóm", "ghi chú"]
    }
]

def retrieve_activities(
    node_type: str,
    node_intent: str = "",
    classroom_ctx: Dict[str, Any] = None,
    limit: int = 5
) -> List[str]:
    """
    RAG engine cho hoạt động dạy học: Lọc & Tính điểm mức độ phù hợp của hoạt động
    dựa trên Node Type và cấu hình Classroom Context.
    
    Args:
        node_type: Loại node hiện tại (Khởi động, Hình thành kiến thức, Luyện tập, Vận dụng, Tổng kết...)
        node_intent: Mục đích/mục tiêu sư phạm của node
        classroom_ctx: Cấu hình lớp học từ client
        limit: Số lượng hoạt động tối đa cần lấy
        
    Returns:
        List[str]: Danh sách mô tả hoạt động phù hợp dạng "Tên hoạt động: Mô tả"
    """
    classroom_ctx = classroom_ctx or {}
    
    # ── 1. Đọc classroom parameters ──────────────────────────────────────────
    learning_space = classroom_ctx.get("learningSpace", "classroom")
    student_device = classroom_ctx.get("studentDevice", [])
    if isinstance(student_device, str):
        student_device = [student_device]
        
    student_count_str = classroom_ctx.get("studentCount", "11-30")
    duration = int(classroom_ctx.get("duration", 45))
    learning_outcome = classroom_ctx.get("learning_outcome", "")
    
    scored_activities = []
    
    # Chuẩn hóa node_type để so sánh
    node_type_lower = node_type.lower()
    normalized_node = "Lý thuyết"
    if "khởi động" in node_type_lower or "warm" in node_type_lower or "mở đầu" in node_type_lower:
        normalized_node = "Khởi động"
    elif "hình thành" in node_type_lower or "kiến thức" in node_type_lower or "core" in node_type_lower:
        normalized_node = "Hình thành kiến thức"
    elif "luyện tập" in node_type_lower or "practice" in node_type_lower:
        normalized_node = "Luyện tập"
    elif "vận dụng" in node_type_lower or "apply" in node_type_lower or "application" in node_type_lower:
        normalized_node = "Vận dụng"
    elif "tổng kết" in node_type_lower or "wrap" in node_type_lower or "kết thúc" in node_type_lower:
        normalized_node = "Tổng kết"

    for act in ACTIVITIES_POOL:
        score = 0
        
        # ── 2. Lọc cứng (Hard Filters) ───────────────────────────────────────
        
        # 2a. Lọc theo không gian học (learningSpace)
        if learning_space and learning_space not in act["suitable_spaces"]:
            # Phạt rất nặng nếu không phù hợp không gian
            score -= 100
            
        # 2b. Lọc theo thiết bị học sinh (studentDevice)
        # Nếu hoạt động đòi hỏi thiết bị (ví dụ: phone, laptop) mà học sinh không có loại thiết bị đó
        for req_dev in act["required_devices"]:
            if req_dev not in student_device:
                score -= 100
                break
                
        # ── 3. Cộng điểm cộng hưởng (Heuristic Scoring) ──────────────────────
        
        # 3a. Khớp loại Node (Quan trọng nhất)
        if normalized_node in act["suitable_nodes"]:
            score += 30
        else:
            # Vẫn cho phép nếu adapt được, nhưng ưu tiên thấp hơn
            score -= 10
            
        # 3b. Khớp mục tiêu sư phạm & kết quả đầu ra (Keyword Overlap)
        query_text = (node_intent + " " + learning_outcome).lower()
        for kw in act["keywords"]:
            if kw in query_text:
                score += 5
                
        # 3c. Ưu tiên theo thời lượng bài học / node
        # Ưu tiên các hoạt động ngắn nếu bài học ngắn
        act_avg_dur = (act["min_duration"] + act["max_duration"]) / 2
        if duration <= 45 and act_avg_dur > 15:
            score -= 5
        elif duration >= 90 and act_avg_dur >= 15:
            score += 3
            
        # 3d. Phù hợp sĩ số lớp học (studentCount)
        if student_count_str == "<=10" and act["group_size"] in ["nhóm nhỏ", "toàn lớp"]:
            score -= 2
        elif student_count_str == ">30" and act["group_size"] == "cặp đôi":
            # Đông quá làm cặp đôi khó kiểm soát tiếng ồn
            score -= 1
            
        scored_activities.append((act, score))
        
    # Sắp xếp giảm dần theo score
    scored_activities.sort(key=lambda x: x[1], reverse=True)
    
    # Lấy top K hoạt động có điểm > -50 (để loại bỏ các hoạt động bị dính hard filter)
    valid_activities = [act for act, score in scored_activities if score > -50]
    
    # Nếu không tìm thấy hoạt động nào hợp lệ (do filter quá chặt), trả về top mặc định không dính hard filter nặng nhất
    if not valid_activities:
        valid_activities = [act for act, score in scored_activities[:limit]]
        
    results = []
    for act in valid_activities[:limit]:
        desc = f"{act['name']} - {act['description']}"
        results.append(desc)
        
    return results
