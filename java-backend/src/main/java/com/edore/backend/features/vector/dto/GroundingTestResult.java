package com.edore.backend.features.vector.dto;

import java.util.List;

public record GroundingTestResult(
        String groundingLevel,
        double topScore,
        double strongThreshold,
        double weakThreshold,
        int matchCount,
        List<MatchResult> topMatches
) {}
