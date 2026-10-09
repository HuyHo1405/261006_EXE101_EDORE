package com.edore.backend.features.lesson.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonForAIResponse {
    private String lessonId;
    private String rawContent;
    private String images;
}
