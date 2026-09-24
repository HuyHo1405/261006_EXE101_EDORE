package com.edore.backend.features.ai.dto.response;

import com.edore.backend.features.vector.dto.GroundingLevel;

import java.util.List;
import java.util.UUID;

/**
 * Full pipeline result returned to the client after AI generation + DB persistence.
 *
 * <p>Verification results are now embedded per-node inside each {@link ScriptNodeResultDto#verification()}
 * field (null = pending async verification). The old top-level {@code verifications} list has been
 * removed to eliminate FE-side index-based joining.</p>
 */
public record ScriptResultDto(
        UUID scriptId,
        String title,
        Long templateId,
        List<ScriptNodeResultDto> nodes,
        GroundingLevel groundingLevel,
        double groundingScore,
        PipelineStats stats
) {
    public record PipelineStats(
            int totalCharsExtracted,
            int totalChunks,
            int nodesGenerated,
            long extractMs,
            long chunkMs,
            long qdrantMs,
            long aiMs,
            long totalMs
    ) {}
}

