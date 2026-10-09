package com.edore.backend.features.lesson.dto.response;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LessonMetadataResponse {
    private String id;
    private String code;
    private String chapterId;
    private String gradeCode;
    private String textbookCode;
    private String subjectCode;
    private Integer orderInChapter;
    private String title;
    private String learningObjectives;
    private String images;
    private Integer version;
    private String status;
    private String ocrQualityFlag;
}


