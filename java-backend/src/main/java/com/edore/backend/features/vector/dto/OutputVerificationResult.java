package com.edore.backend.features.vector.dto;

import java.util.List;

public record OutputVerificationResult(
        String nodeCode,
        FidelityLevel numericFidelity,
        FidelityLevel semanticFidelity,
        List<String> unmatchedClaims
) {}
