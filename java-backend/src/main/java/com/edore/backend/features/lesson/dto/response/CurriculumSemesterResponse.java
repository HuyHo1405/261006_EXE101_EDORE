package com.edore.backend.features.lesson.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Curriculum tree for the "create script" UI: Semester → Chapter → Lesson.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumSemesterResponse {

    @Schema(description = "Mã học kỳ (code của category SEMESTER)", example = "1")
    private String semesterCode;

    @Schema(description = "Tên học kỳ (name của category SEMESTER)", example = "Học kỳ I")
    private String semesterName;

    private List<CurriculumChapterResponse> chapters;
}
