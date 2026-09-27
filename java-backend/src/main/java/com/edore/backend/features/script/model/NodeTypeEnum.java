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
          "hook": {"question_or_situation": "string", "presentation_form": "string"},
          "expected_responses": ["string"],
          "transition_line": "string"
        }"""
    ),

    HINH_THANH_KIEN_THUC(
        "Hình thành kiến thức",
        "Cung cấp kiến thức mới, chia nhỏ theo các đề mục của tài liệu gốc.",
        """
        {
          "knowledge_units": [
            {
              "unit_title": "string",
              "core_content": "string — Markdown. BẮT BUỘC chia thành nhiều đoạn ngắn (mỗi đoạn 2-4 câu, cách nhau bằng dòng trống \\n\\n), KHÔNG viết thành 1 khối văn liền mạch dù nội dung dài. Chia đoạn theo mốc thời gian/ý chính/giai đoạn khi có thể. Nếu có liệt kê nhiều mục ngang hàng (danh sách, các loại, các thành phần), dùng đúng cú pháp Markdown list (- hoặc 1. xuống dòng từng mục), không viết dính liền trong 1 câu văn. Giữ nguyên 100% số liệu từ file input",
              "teacher_delivery": "string",
              "checkpoint_question": "string"
            }
          ],
          "synthesis": "string"
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
