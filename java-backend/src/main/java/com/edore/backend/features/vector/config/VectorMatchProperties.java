package com.edore.backend.features.vector.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Domain-level vector matching properties (collections, thresholds, topK limits).
 *
 * <h3>Verification thresholds:</h3>
 * <ul>
 *   <li><b>RELAXED path</b> (khoi_dong / luyen_tap / van_dung / tong_ket):
 *       cosine similarity vs contextPerNode. Flags if below {@code verificationRelaxedLow}.</li>
 *   <li><b>STRICT path</b> (hinh_thanh):
 *       RAG + LLM-judge per sentence.
 *       Fast path: skip LLM if topScore ≥ {@code verificationStrictFastPath}.
 *       Flag as CONTRADICTED/UNVERIFIABLE if topScore &lt; {@code verificationStrictLow}.</li>
 * </ul>
 */
@ConfigurationProperties(prefix = "qdrant.match")
public record VectorMatchProperties(
        String collectionCurriculum,
        String collectionActivities,
        double similarityStrongThreshold,
        double similarityWeakThreshold,
        int topK,

        // ── Verification thresholds ───────────────────────────────────────────

        /** RELAXED: cosine < this → LOW fidelity flag. Default 0.35. */
        double verificationRelaxedLow,

        /** RELAXED: cosine < this → MEDIUM fidelity. Default 0.55. */
        double verificationRelaxedMedium,

        /**
         * STRICT fast-path: if RAG topScore ≥ this, skip LLM call → SUPPORTED.
         * Default 0.85.
         */
        double verificationStrictFastPath,

        /**
         * STRICT: if RAG topScore < this, skip LLM (insufficient evidence) → UNVERIFIABLE.
         * Default 0.35.
         */
        double verificationStrictMinEvidence
) {
    public VectorMatchProperties {
        if (collectionCurriculum == null || collectionCurriculum.isBlank()) {
            collectionCurriculum = "curriculum_reference";
        }
        if (collectionActivities == null || collectionActivities.isBlank()) {
            collectionActivities = "activity_bank";
        }
        if (similarityStrongThreshold <= 0) similarityStrongThreshold = 0.75;
        if (similarityWeakThreshold   <= 0) similarityWeakThreshold   = 0.45;
        if (topK <= 0) topK = 5;

        // Verification defaults
        if (verificationRelaxedLow      <= 0) verificationRelaxedLow      = 0.35;
        if (verificationRelaxedMedium   <= 0) verificationRelaxedMedium   = 0.55;
        if (verificationStrictFastPath  <= 0) verificationStrictFastPath  = 0.85;
        if (verificationStrictMinEvidence <= 0) verificationStrictMinEvidence = 0.35;
    }
}

