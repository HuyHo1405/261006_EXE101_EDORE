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
public class CurriculumLessonResponse {

    @Schema(description = "Lesson ID (UUID)")
    private String id;

    @Schema(description = "Mã bài học", example = "LS6_KNTT_B01")
    private String code;

    @Schema(description = "Tên bài học")
    private String title;

    @Schema(description = "Thứ tự bài trong chương", example = "1")
    private Integer orderInChapter;

    @Schema(description = "Khối lớp", example = "6")
    private String gradeCode;

    @Schema(description = "Môn học", example = "LS")
    private String subjectCode;

    @Schema(description = "Bộ sách", example = "KNTT")
    private String textbookCode;

    @Schema(description = "Yêu cầu cần đạt (JSON string)")
    private String learningObjectives;
}
