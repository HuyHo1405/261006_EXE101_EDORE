package com.edore.backend.features.lesson.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CurriculumChapterResponse {

    @Schema(description = "ID chương")
    private String id;

    @Schema(description = "Thứ tự chương", example = "1")
    private Integer order;

    @Schema(description = "Tên chương")
    private String title;

    private List<CurriculumLessonResponse> lessons;
}
