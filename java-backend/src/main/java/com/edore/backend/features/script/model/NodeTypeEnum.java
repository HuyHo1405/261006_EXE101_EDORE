package com.edore.backend.features.script.model;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum NodeTypeEnum {

    KHOI_DONG(
        "Khởi động",
        "Kích thích sự tò mò, huy động kiến thức nền và dẫn dắt vào bài học.",
        """
        {
          "activity_type": "QUESTION_BASED | VISUAL_TEASER | PROBLEM_SITUATION",
          "activity_type_label": "string — tên hiển thị tiếng Việt",
          "activity_name": "string — Tên hoạt động khởi động ngắn gọn",
          "visual_action": "string — BƯỚC 1: HÀNH ĐỘNG MỒI CỦA GV. (Nếu là VISUAL_TEASER thì GV chiếu hình ảnh. Nếu là QUESTION_BASED thì GV đặt câu hỏi gây sốc/gợi mở. Nếu là PROBLEM_SITUATION thì GV nêu tình huống. Mô tả thao tác nhanh gọn).",
          "quick_connection": "string — BƯỚC 2: HỌC SINH PHẢN XẠ NHANH. (HS đồng thanh trả lời/gọi tên/đưa ý kiến trong 1 phút. Bắt buộc thêm lưu ý: Không mổ xẻ phân tích sâu).",
          "conclusion": "string — BƯỚC 3: LỜI KHEN NGỢI & ĐÚC KẾT CẢM XÚC (Tạo hứng thú).",
          "bridge_question": "string — BƯỚC 4: Lời dẫn/Câu hỏi cầu nối mượt mà vào bài mới.",
          "used_image_ids": ["string — (Tùy chọn) Chọn đúng ID ảnh từ danh sách available_images nếu có ảnh minh hoạ phù hợp"]
        }"""
    ),

    HINH_THANH_KIEN_THUC(
        "Hình thành kiến thức",
        "Cung cấp kiến thức mới, chia nhỏ theo các đề mục của tài liệu gốc.",
        """
        {
          "pedagogical_approach": "INDUCTIVE | DEDUCTIVE | PROBLEM_BASED",
          "knowledge_units": [
            {
              "unit_title": "string",
              "used_image_ids": ["string — CHỈ LẤY ID TỪ available_images. Tuyệt đối không tự bịa ID mới!"],
              "visual_example": { "title": "string", "item": "string", "description": "string — BẮT BUỘC mô tả THAO TÁC CỦA GIÁO VIÊN VỚI ảnh/hiện vật." },
              "teacher_explanation": "string — Lời giáo viên giảng giải cặn kẽ, phân tích rõ bản chất và gỡ rối điểm học sinh dễ nhầm lẫn",
              "core_content": "string — Markdown. BẮT BUỘC chia thành nhiều đoạn ngắn (mỗi đoạn 2-4 câu, cách nhau bằng escape sequence `\\n\\n` trong JSON, KHÔNG BẤM ENTER XUỐNG DÒNG THỰC SỰ). KHÔNG viết thành 1 khối văn liền mạch dù nội dung dài. Chia đoạn theo mốc thời gian/ý chính/giai đoạn khi có thể. Giữ nguyên 100% số liệu từ file input",
              "content_navigation": {
                "guiding_tip": "string — Mẹo dẫn dắt nếu học sinh trả lời sai hoặc bế tắc",
                "questions": ["string — Câu hỏi chính kiểm tra mức độ hiểu bài", "string — (Tùy chọn) Câu hỏi phụ đào sâu hoặc gợi mở thêm số 1", "string — (Tùy chọn) Câu hỏi phụ số 2..."]
              }
            }
          ],
          "synthesis": "string — Chốt kiến thức toàn bài (Đúc kết sau khi hoàn thành các phần)"
        }"""
    ),

    LUYEN_TAP(
        "Luyện tập",
        "Củng cố kiến thức vừa học thông qua hệ thống câu hỏi, bài tập cụ thể.",
        """
        {
          "exercises": [
            {
              "question": "string",
              "level": "nhan_biet|thong_hieu|van_dung_thap|van_dung_cao",
              "answer": "string",
              "format": "string"
            }
          ]
        }"""
    ),

    VAN_DUNG(
        "Vận dụng",
        "Đưa kiến thức vào tình huống thực tế hoặc giao dự án nhỏ.",
        """
        {
          "scenario": "string",
          "task_requirement": "string",
          "expected_output_form": "string",
          "rubric": [{"criterion": "string", "description": "string"}],
          "scaffolding_hint": "string"
        }"""
    );

    private final String title;
    private final String intent;
    private final String jsonSchema;
}
