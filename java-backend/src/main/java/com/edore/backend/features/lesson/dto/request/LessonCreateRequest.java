package com.edore.backend.features.lesson.dto.request;

import lombok.Data;

@Data
public class LessonCreateRequest {
    private String id; // Optional if auto-generated, but keeping it for backward compat.
    private String code;
    private String chapterId;
    private String gradeCode;
    private String textbookCode;
    private String subjectCode;
    private Integer orderInChapter;
    private String title;
    private String learningObjectives;
    private String images; 
    private String rawContent;
}


