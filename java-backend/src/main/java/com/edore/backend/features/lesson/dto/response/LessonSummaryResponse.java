package com.edore.backend.features.lesson.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonSummaryResponse {

    @Schema(description = "Lesson ID (UUID) — Dùng ID này để truyền vào API tạo script", example = "b171b26c-7608-4871-81bb-d6ce84d7871f")
    private String id;

    @Schema(description = "Mã bài học", example = "LS8_KNTT_B01")
    private String code;

    @Schema(description = "Tên bài học", example = "CÁCH MẠNG TƯ SẢN ANH VÀ CHIẾN TRANH GIÀNH ĐỘC LẬP CỦA 13 THUỘC ĐỊA ANH Ở BẮC MỸ")
    private String title;

    @Schema(description = "Thứ tự bài học trong chương (Bài số mấy)", example = "1")
    private Integer orderInChapter;

    @Schema(description = "Khối lớp", example = "8")
    private String gradeCode;

    @Schema(description = "Môn học", example = "LS")
    private String subjectCode;

    @Schema(description = "Bộ sách", example = "KNTT")
    private String textbookCode;

    @Schema(description = "ID chương", example = "f2a85d8c-5108-4887-9dbe-3c653600d0dc")
    private String chapterId;

    @Schema(description = "Tên chương", example = "CHÂU ÂU VÀ BẮC MỸ TỪ NỬA SAU THẾ KỈ XVI ĐẾN THẾ KỈ XVIII")
    private String chapterTitle;
}
