package com.edore.backend.features.lesson.dto.request;

import lombok.Data;

@Data
public class ChapterCreateRequest {
    private String id; // Optional
    private String title;
    private String description;
    private Integer order;
}
