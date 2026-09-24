package com.edore.backend.features.vector.service.impl;

import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.vector.client.EmbeddingClient;
import com.edore.backend.features.vector.dto.FidelityLevel;
import com.edore.backend.features.vector.dto.OutputVerificationResult;
import com.edore.backend.features.vector.service.OutputVerificationService;
import com.edore.backend.features.vector.service.VectorMatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Slf4j
@Service
@RequiredArgsConstructor
public class OutputVerificationServiceImpl implements OutputVerificationService {

    private final EmbeddingClient   embeddingClient;
    private final VectorMatchService vectorMatchService;

    private static final Pattern NUMERIC_PATTERN = Pattern.compile("\\b\\d+(?:[.,]\\d+)?\\b");

    @Override
    public List<OutputVerificationResult> verifyScriptNodes(List<ScriptNodeResultDto> nodes, String sourceText) {
        if (nodes == null || nodes.isEmpty()) {
            return List.of();
        }

        List<OutputVerificationResult> results = new ArrayList<>();
        String safeSource = sourceText != null ? sourceText : "";

        // Precompute source vector if Qdrant/Embedding is enabled & available
        float[] sourceVector = null;
        if (vectorMatchService.isAvailable()) {
            try {
                sourceVector = embeddingClient.embed(safeSource);
            } catch (Exception e) {
                log.warn("[OutputVerification] Source embedding failed: {}", e.getMessage());
            }
        }

        for (ScriptNodeResultDto node : nodes) {
            String nodeContentStr = String.join(" ", node.nodeContent() != null ? node.nodeContent() : List.of());

            // 1. Deterministic Numeric Verification
            List<String> unmatchedNumbers = new ArrayList<>();
            Matcher matcher = NUMERIC_PATTERN.matcher(nodeContentStr);

            int totalNumbersFound = 0;
            while (matcher.find()) {
                String num = matcher.group();
                totalNumbersFound++;
                if (!safeSource.contains(num)) {
                    unmatchedNumbers.add(num);
                }
            }

            // 0. Micro-Title & Custom Activity Audit
            if (node.title() != null && node.title().length() > 30) {
                log.warn("[OutputVerification] Node title '{}' exceeds micro-label threshold ({} chars)", node.title(), node.title().length());
            }

            if (Boolean.TRUE.equals(node.isCustomActivity())) {
                log.warn("[OutputVerification] AUDIT NOTICE: AI generated a custom activity outside database templates for nodeType='{}' (appliedActivity='{}')",
                        node.nodeType(), node.appliedActivity());
            }

            FidelityLevel numericFidelity = FidelityLevel.HIGH;
            if (!unmatchedNumbers.isEmpty()) {
                double missingRatio = (double) unmatchedNumbers.size() / Math.max(1, totalNumbersFound);
                numericFidelity = missingRatio > 0.4 ? FidelityLevel.LOW : FidelityLevel.MEDIUM;
            }

            // 2. Semantic Drift Verification
            FidelityLevel semanticFidelity = FidelityLevel.HIGH;
            if (sourceVector != null && sourceVector.length > 0 && !nodeContentStr.isBlank()) {
                try {
                    float[] nodeVector = embeddingClient.embed(nodeContentStr);
                    double cosineSim = computeCosineSimilarity(nodeVector, sourceVector);

                    if (cosineSim < 0.45) {
                        semanticFidelity = FidelityLevel.LOW;
                    } else if (cosineSim < 0.70) {
                        semanticFidelity = FidelityLevel.MEDIUM;
                    }
                } catch (Exception e) {
                    log.warn("[OutputVerification] Node embedding failed for nodeType='{}': {}", node.nodeType(), e.getMessage());
                }
            }

            results.add(new OutputVerificationResult(
                    node.nodeType(),
                    numericFidelity,
                    semanticFidelity,
                    unmatchedNumbers
            ));
        }

        return results;
    }

    private double computeCosineSimilarity(float[] vectorA, float[] vectorB) {
        if (vectorA == null || vectorB == null || vectorA.length != vectorB.length || vectorA.length == 0) {
            return 0.0;
        }

        double dotProduct = 0.0;
        double normA = 0.0;
        double normB = 0.0;

        for (int i = 0; i < vectorA.length; i++) {
            dotProduct += vectorA[i] * vectorB[i];
            normA += vectorA[i] * vectorA[i];
            normB += vectorB[i] * vectorB[i];
        }

        if (normA == 0.0 || normB == 0.0) {
            return 0.0;
        }

        return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
    }
}
