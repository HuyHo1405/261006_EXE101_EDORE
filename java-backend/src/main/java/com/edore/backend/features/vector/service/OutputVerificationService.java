package com.edore.backend.features.vector.service;

import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.vector.dto.OutputVerificationResult;

import java.util.List;

/**
 * Verifies generated AI script node content against source text.
 * Performs deterministic numeric/date verification and optional semantic similarity verification.
 */
public interface OutputVerificationService {

    /**
     * Verify a list of generated script nodes against raw source text.
     */
    List<OutputVerificationResult> verifyScriptNodes(List<ScriptNodeResultDto> nodes, String sourceText);
}
