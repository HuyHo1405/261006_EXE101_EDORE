package com.edore.backend.features.vector.dto;

import java.util.Map;

public record IndexRequest(
        String docId,
        String text,
        String subject,
        String grade,
        Map<String, Object> metadata,
        String collection
) {}
