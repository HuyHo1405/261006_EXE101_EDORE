package com.edore.backend.features.lesson.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LessonQuestionResponse {
    private String id;
    private String lessonId;
    private String lessonCode;
    private String questionText;
    private List<String> options;
    private Integer correctAnswer;
    private Integer timeLimit;
    private String stageTag;
    private String difficulty;
    private String explanation;
}
