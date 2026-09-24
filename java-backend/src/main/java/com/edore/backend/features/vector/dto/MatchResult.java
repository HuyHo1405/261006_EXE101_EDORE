package com.edore.backend.features.vector.dto;

import java.util.Map;

public record MatchResult(
        String docId,
        double score,
        Map<String, Object> metadata
) {}
