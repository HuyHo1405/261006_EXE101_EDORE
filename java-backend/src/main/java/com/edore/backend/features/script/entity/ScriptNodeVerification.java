package com.edore.backend.features.script.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;

/**
 * Stores the fact-check verification result for a single {@link ScriptNode}.
 *
 * <p>Kept as a separate table (not in ScriptNode.settings JSONB) to allow:
 * <ul>
 *   <li>Independent lifecycle (async Phase 2, re-verify on demand)</li>
 *   <li>Queryable status/flag counts without JSON scanning</li>
 *   <li>Clean audit trail: when was each node verified, by which path</li>
 * </ul>
 *
 * <h3>Strictness tiers (see {@link com.edore.backend.features.script.util.NodeCodeClassifier}):</h3>
 * <ul>
 *   <li><b>STRICT</b>  — hinh_thanh: RAG + LLM-judge per sentence</li>
 *   <li><b>RELAXED</b> — khoi_dong / luyen_tap / van_dung / tong_ket: cosine similarity only</li>
 * </ul>
 */
@Entity
@Table(name = "script_node_verifications")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class ScriptNodeVerification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    /** The node this verification belongs to (1:1 per node per verify run). */
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "script_node_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private ScriptNode scriptNode;

    /**
     * Processing status of this verification job.
     * Transitions: PENDING → RUNNING → DONE | FAILED
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private VerificationStatus status = VerificationStatus.PENDING;

    /**
     * Which strictness path was used.
     * Populated when verification starts; useful for debugging and analytics.
     */
    @Enumerated(EnumType.STRING)
    @Column(name = "strictness", length = 20)
    private NodeVerificationStrictness strictness;

    /**
     * Array of flagged claim records in JSONB.
     * Each element is a {@link FlaggedClaim} detailing one suspect sentence.
     * Empty list = no flags (clean node).
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "flagged_claims", columnDefinition = "jsonb")
    private List<FlaggedClaim> flaggedClaims;

    /** Timestamp when verification completed (DONE or FAILED). */
    @LastModifiedDate
    @Column(name = "verified_at")
    private Instant verifiedAt;

    /** Error message when status = FAILED. */
    @Column(name = "error_message", columnDefinition = "text")
    private String errorMessage;

    // ── Embedded types ────────────────────────────────────────────────────────

    /**
     * Verification status lifecycle.
     */
    public enum VerificationStatus {
        /** Queued — async job not yet started. */
        PENDING,
        /** Currently being verified. */
        RUNNING,
        /** Verification completed successfully. */
        DONE,
        /** Verification failed (e.g. LLM error, embedding failure). */
        FAILED
    }

    /**
     * Which verification path was applied to this node.
     */
    public enum NodeVerificationStrictness {
        /**
         * Full RAG + LLM-judge pipeline.
         * Applied to {@code hinh_thanh} (knowledge-formation) nodes only.
         */
        STRICT,
        /**
         * Cosine similarity check only (no LLM call).
         * Applied to {@code khoi_dong, luyen_tap, van_dung, tong_ket}.
         */
        RELAXED
    }

    /**
     * A single flagged claim produced by the verification step.
     *
     * <p>Stored as JSONB array inside {@link ScriptNodeVerification#flaggedClaims}.</p>
     *
     * <p>Uses {@code @Data} (not {@code @Value}) so {@code applied} can be mutated
     * when the user applies a suggestion via the PATCH endpoint.</p>
     */
    @lombok.Data
    @lombok.Builder
    @lombok.NoArgsConstructor
    @lombok.AllArgsConstructor
    @com.fasterxml.jackson.annotation.JsonInclude(com.fasterxml.jackson.annotation.JsonInclude.Include.NON_NULL)
    public static class FlaggedClaim {

        /** The original sentence from node content that triggered the flag. */
        String originalSentence;

        /**
         * Why this sentence was flagged.
         * e.g. "Số liệu không tìm thấy trong nguồn", "Mâu thuẫn với tài liệu chuẩn"
         */
        String reason;

        /**
         * The snippet from the reference source that was retrieved as evidence.
         * Null for RELAXED path (no RAG retrieval).
         */
        String evidenceFromSource;

        /**
         * LLM-suggested replacement sentence.
         * Null if LLM judge was not invoked (fast path or RELAXED).
         */
        String suggestedReplacement;

        /** LLM verdict on the claim. */
        ClaimVerdict verdict;

        /** Confidence level of the verdict. */
        ClaimConfidence confidence;

        /** True if user has already applied the {@link #suggestedReplacement}. */
        boolean applied;

        public enum ClaimVerdict {
            /** Claim is confirmed by retrieved evidence. */
            SUPPORTED,
            /** Claim contradicts retrieved evidence. */
            CONTRADICTED,
            /** Evidence is inconclusive or missing. */
            UNVERIFIABLE
        }

        public enum ClaimConfidence {
            HIGH, MEDIUM, LOW
        }
    }
}
