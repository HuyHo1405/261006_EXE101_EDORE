package com.edore.backend.features.ai.dto.response;

import com.edore.backend.features.script.dto.ScriptNodeVerificationDto;

import java.util.List;
import java.util.Map;

/**
 * AI-generated content for a single lesson node.
 * Maps to ScriptNode.settings (JSONB) in the database.
 *
 * <p>{@code verification} is {@code null} immediately after Phase 1 (script generation).
 * It is populated once Phase 2 (async fact-check) completes for this node,
 * either via SSE push or on the next GET /scripts/{id} call.</p>
 */
public record ScriptNodeResultDto(
        String nodeType,
        String title,
        String nodeIntent,
        List<String> mappedKnowledge,
        List<String> nodeContent,
        String appliedActivity,
        String appliedActivityCode,
        Boolean isCustomActivity,
        List<String> executionSteps,

        /**
         * Per-step teaching content, aligned 1-1 with {@code executionSteps}.
         * {@code stepContent[i]} is the detailed instructional content for {@code executionSteps[i]}.
         * This allows the UI InlineEditor to display the correct content for each step accordion.
         */
        List<String> stepContent,

        List<String> interactionFlow,
        Object nodePayload,

        Integer estimatedTimeMinutes,
        List<String> materialsNeeded,

        /**
         * Verification result for this node.
         * {@code null}  = verification not yet run (auto-verify pending or toggle is OFF).
         * Non-null      = verification completed; check {@code status} field inside.
         */
        ScriptNodeVerificationDto verification
) {
    /** Create a copy of this DTO with verification result attached (immutable record workaround). */
    public ScriptNodeResultDto withVerification(ScriptNodeVerificationDto v) {
        return new ScriptNodeResultDto(nodeType, title, nodeIntent, mappedKnowledge, nodeContent,
                appliedActivity, appliedActivityCode, isCustomActivity, executionSteps, stepContent,
                interactionFlow, nodePayload, estimatedTimeMinutes, materialsNeeded, v);
    }
}

