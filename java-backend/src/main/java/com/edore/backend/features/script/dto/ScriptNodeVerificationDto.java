package com.edore.backend.features.script.dto;

import com.edore.backend.features.script.entity.ScriptNodeVerification.FlaggedClaim;
import com.edore.backend.features.script.entity.ScriptNodeVerification.NodeVerificationStrictness;
import com.edore.backend.features.script.entity.ScriptNodeVerification.VerificationStatus;

import java.time.Instant;
import java.util.List;

/**
 * DTO representation of {@link com.edore.backend.features.script.entity.ScriptNodeVerification}
 * returned alongside each node in the API response.
 *
 * <p>Embedded directly in {@link com.edore.backend.features.ai.dto.response.ScriptNodeResultDto}
 * as a nullable field — {@code null} means verification has not run yet (Phase 2 pending).</p>
 */
public record ScriptNodeVerificationDto(
        Long verificationId,
        VerificationStatus status,
        NodeVerificationStrictness strictness,
        List<FlaggedClaim> flaggedClaims,
        Instant verifiedAt,
        String errorMessage
) {
    /** Convenience factory for pending state (Phase 2 not yet triggered). */
    public static ScriptNodeVerificationDto pending(Long verificationId) {
        return new ScriptNodeVerificationDto(verificationId, VerificationStatus.PENDING,
                null, List.of(), null, null);
    }
}
