package com.edore.backend.features.vector.dto;

public record GroundingTestRequest(
        String text,
        String collection,
        Integer topK,
        String subject,
        String grade
) {}
