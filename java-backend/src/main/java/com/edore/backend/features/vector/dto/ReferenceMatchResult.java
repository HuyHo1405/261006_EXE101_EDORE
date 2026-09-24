package com.edore.backend.features.vector.dto;

import java.util.List;

public record ReferenceMatchResult(
        List<MatchResult> matches,
        double topScore,
        GroundingLevel level
) {
    public static ReferenceMatchResult empty() {
        return new ReferenceMatchResult(List.of(), 0.0, GroundingLevel.NONE);
    }
}
