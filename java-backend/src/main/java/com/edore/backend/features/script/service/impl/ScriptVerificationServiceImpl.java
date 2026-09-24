package com.edore.backend.features.script.service.impl;

import com.edore.backend.core.config.AsyncVerificationConfig;
import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.features.ai.client.LlmApiClient;
import com.edore.backend.features.ai.client.dto.LlmMessage;
import com.edore.backend.features.script.entity.ScriptNode;
import com.edore.backend.features.script.entity.ScriptNodeVerification;
import com.edore.backend.features.script.entity.ScriptNodeVerification.FlaggedClaim;
import com.edore.backend.features.script.entity.ScriptNodeVerification.FlaggedClaim.ClaimConfidence;
import com.edore.backend.features.script.entity.ScriptNodeVerification.FlaggedClaim.ClaimVerdict;
import com.edore.backend.features.script.entity.ScriptNodeVerification.NodeVerificationStrictness;
import com.edore.backend.features.script.entity.ScriptNodeVerification.VerificationStatus;
import com.edore.backend.features.script.repository.ScriptNodeRepository;
import com.edore.backend.features.script.repository.ScriptNodeVerificationRepository;
import com.edore.backend.features.script.service.ScriptVerificationService;
import com.edore.backend.features.script.util.NodeCodeClassifier;
import com.edore.backend.features.vector.client.EmbeddingClient;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.dto.ReferenceMatchResult;
import com.edore.backend.features.vector.service.VectorMatchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Implements the two-tier fact-check verification pipeline.
 *
 * <h3>RELAXED path (khoi_dong / luyen_tap / van_dung / tong_ket):</h3>
 * <ol>
 *   <li>Embed node content</li>
 *   <li>Compare cosine similarity against {@code contextPerNode} (not rawText)</li>
 *   <li>Flag if below threshold — no numeric check (numbers are AI examples)</li>
 * </ol>
 *
 * <h3>STRICT path (hinh_thanh only):</h3>
 * <ol>
 *   <li>Split content into sentences</li>
 *   <li>For each sentence: call {@code VectorMatchService.findSimilarReferences()} for top-K evidence</li>
 *   <li>Fast-path: topScore ≥ fastPathThreshold → mark SUPPORTED, skip LLM</li>
 *   <li>Slow-path: topScore in gray zone → call LLM-judge with evidence snippets</li>
 *   <li>LLM returns JSON with verdict, evidenceFromSource, suggestedReplacement, confidence</li>
 *   <li>Ground-truth check: verify LLM-cited evidence actually appears in rawText/context</li>
 *   <li>Numeric check: flag numbers not present in source (stricter than RELAXED)</li>
 * </ol>
 *
 * <p><b>Important:</b> This class is a separate Spring bean from {@code AiPipelineServiceImpl}.
 * The {@code @Async} methods will be proxied correctly only because of this separation.</p>
 */
@Slf4j
@Service
@EnableConfigurationProperties(VectorMatchProperties.class)
@RequiredArgsConstructor
public class ScriptVerificationServiceImpl implements ScriptVerificationService {

    private final VectorMatchService                  vectorMatchService;
    private final EmbeddingClient                     embeddingClient;
    private final LlmApiClient                        llmApiClient;
    private final LlmProperties                       llmProperties;
    private final VectorMatchProperties               vectorMatchProperties;
    private final ScriptNodeVerificationRepository    verificationRepository;
    private final ScriptNodeRepository                scriptNodeRepository;

    private static final ObjectMapper MAPPER = new ObjectMapper();
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+|(?<=\\n)\\n");
    private static final Pattern NUMERIC_PATTERN = Pattern.compile("\\b\\d+(?:[.,]\\d+)?\\b");

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    @Async(AsyncVerificationConfig.VERIFICATION_EXECUTOR)
    public void verifyScriptAsync(UUID scriptId,
                                   List<ScriptNode> scriptNodes,
                                   Map<String, String> contextPerNode,
                                   String rawText) {
        log.info("[Verification] Starting async verification for scriptId={} nodes={}", scriptId, scriptNodes.size());
        int flaggedCount = 0;

        for (ScriptNode node : scriptNodes) {
            String nodeCode = node.getNodeType() != null ? node.getNodeType().getCode() : null;
            ScriptNodeVerification verification = createPending(node);

            try {
                verification.setStatus(VerificationStatus.RUNNING);
                verificationRepository.save(verification);

                List<FlaggedClaim> flags = runVerification(node, nodeCode, contextPerNode, rawText);

                verification.setStatus(VerificationStatus.DONE);
                verification.setFlaggedClaims(flags);
                if (!flags.isEmpty()) flaggedCount++;

            } catch (Exception ex) {
                log.error("[Verification] Failed for nodeId={} code={}: {}", node.getId(), nodeCode, ex.getMessage(), ex);
                verification.setStatus(VerificationStatus.FAILED);
                verification.setErrorMessage(ex.getMessage());
            }

            verificationRepository.save(verification);
            log.debug("[Verification] Node {} ({}) done — flags={}", node.getId(), nodeCode,
                    verification.getFlaggedClaims() != null ? verification.getFlaggedClaims().size() : 0);
        }

        // Analytics log — used to measure flag rate over time
        log.info("[Verification] scriptId={} COMPLETE — {}/{} nodes flagged ({}%)",
                scriptId, flaggedCount, scriptNodes.size(),
                scriptNodes.isEmpty() ? 0 : Math.round(100.0 * flaggedCount / scriptNodes.size()));
    }

    @Override
    @Async(AsyncVerificationConfig.VERIFICATION_EXECUTOR)
    public void reVerifyNode(Long scriptNodeId, Map<String, String> contextPerNode, String rawText) {
        ScriptNode node = scriptNodeRepository.findById(scriptNodeId).orElse(null);
        if (node == null) {
            log.warn("[Verification] reVerifyNode: ScriptNode {} not found", scriptNodeId);
            return;
        }
        String nodeCode = node.getNodeType() != null ? node.getNodeType().getCode() : null;

        // Reuse or create verification record
        ScriptNodeVerification verification = verificationRepository
                .findByScriptNodeId(scriptNodeId)
                .orElseGet(() -> createPending(node));

        try {
            verification.setStatus(VerificationStatus.RUNNING);
            verification.setErrorMessage(null);
            verificationRepository.save(verification);

            List<FlaggedClaim> flags = runVerification(node, nodeCode, contextPerNode, rawText);
            verification.setStatus(VerificationStatus.DONE);
            verification.setFlaggedClaims(flags);

        } catch (Exception ex) {
            log.error("[Verification] Re-verify failed for nodeId={}: {}", scriptNodeId, ex.getMessage(), ex);
            verification.setStatus(VerificationStatus.FAILED);
            verification.setErrorMessage(ex.getMessage());
        }

        verificationRepository.save(verification);
    }

    // ── Core dispatch ─────────────────────────────────────────────────────────

    private List<FlaggedClaim> runVerification(ScriptNode node, String nodeCode,
                                                Map<String, String> contextPerNode,
                                                String rawText) {
        NodeVerificationStrictness strictness = NodeCodeClassifier.isStrictNode(nodeCode)
                ? NodeVerificationStrictness.STRICT
                : NodeVerificationStrictness.RELAXED;

        // Persist strictness for audit
        verificationRepository.findByScriptNodeId(node.getId()).ifPresent(v -> {
            v.setStrictness(strictness);
            verificationRepository.save(v);
        });

        String nodeContentStr = extractNodeContent(node);
        String context        = contextPerNode.getOrDefault(nodeCode, rawText != null ? rawText : "");

        log.debug("[Verification] nodeId={} strictness={} contentLen={}", node.getId(), strictness, nodeContentStr.length());

        return switch (strictness) {
            case RELAXED -> verifyRelaxed(node.getId(), nodeContentStr, context);
            case STRICT  -> verifyStrict(node.getId(), nodeContentStr, context, rawText);
        };
    }

    // ── RELAXED path ──────────────────────────────────────────────────────────

    /**
     * Cosine similarity between node content and its corresponding context chunk.
     * Numeric check is disabled (numbers in khoi_dong/luyen_tap/van_dung/tong_ket
     * are AI-generated examples, not factual claims to verify).
     */
    private List<FlaggedClaim> verifyRelaxed(Long nodeId, String content, String context) {
        if (content.isBlank() || context.isBlank() || !vectorMatchService.isAvailable()) {
            return List.of();
        }

        try {
            float[] contentVec = embeddingClient.embed(content);
            float[] contextVec = embeddingClient.embed(context);
            double cosine      = cosineSimilarity(contentVec, contextVec);

            log.debug("[Verification/RELAXED] nodeId={} cosine={}", nodeId, String.format("%.3f", cosine));

            if (cosine < vectorMatchProperties.verificationRelaxedLow()) {
                return List.of(FlaggedClaim.builder()
                        .originalSentence("[FULL NODE]")
                        .reason(String.format("Độ tương đồng ngữ nghĩa thấp (%.2f < %.2f) — nội dung có thể lệch xa tài liệu gốc.", cosine, vectorMatchProperties.verificationRelaxedLow()))
                        .verdict(ClaimVerdict.UNVERIFIABLE)
                        .confidence(ClaimConfidence.MEDIUM)
                        .applied(false)
                        .build());
            }

            if (cosine < vectorMatchProperties.verificationRelaxedMedium()) {
                return List.of(FlaggedClaim.builder()
                        .originalSentence("[FULL NODE]")
                        .reason(String.format("Độ tương đồng ngữ nghĩa trung bình (%.2f). Nội dung chấp nhận được nhưng cần review.", cosine, vectorMatchProperties.verificationRelaxedMedium()))
                        .verdict(ClaimVerdict.UNVERIFIABLE)
                        .confidence(ClaimConfidence.LOW)
                        .applied(false)
                        .build());
            }
        } catch (Exception e) {
            log.warn("[Verification/RELAXED] Embedding failed for nodeId={}: {}", nodeId, e.getMessage());
        }

        return List.of();
    }

    // ── STRICT path ───────────────────────────────────────────────────────────

    /**
     * Per-sentence RAG + LLM-judge verification.
     * Also runs numeric check (numbers in hinh_thanh should come from source).
     */
    private List<FlaggedClaim> verifyStrict(Long nodeId, String content, String context, String rawText) {
        List<FlaggedClaim> flags = new ArrayList<>();

        // 1. Numeric check (STRICT only)
        flags.addAll(numericCheck(content, rawText != null ? rawText : context));

        if (!vectorMatchService.isAvailable()) {
            log.warn("[Verification/STRICT] nodeId={} — vector service unavailable, skipping RAG+LLM", nodeId);
            return flags;
        }

        // 2. Sentence-level RAG + LLM-judge
        List<String> sentences = splitSentences(content);
        log.debug("[Verification/STRICT] nodeId={} sentences={}", nodeId, sentences.size());

        for (String sentence : sentences) {
            if (sentence.length() < 10) continue; // skip very short fragments

            try {
                FlaggedClaim claim = verifySentence(sentence, context, rawText);
                if (claim != null) flags.add(claim);
            } catch (Exception e) {
                log.warn("[Verification/STRICT] Sentence check failed nodeId={}: {}", nodeId, e.getMessage());
            }
        }

        return flags;
    }

    private FlaggedClaim verifySentence(String sentence, String context, String rawText) {
        // RAG: retrieve top-K evidence from curriculum collection
        // Fallback: if collection sparse (topScore < minEvidence), use contextPerNode
        ReferenceMatchResult rag = vectorMatchService.findSimilarReferences(
                sentence,
                vectorMatchProperties.collectionCurriculum(),
                vectorMatchProperties.topK()
        );

        String evidenceSource;
        double topScore = rag.topScore();

        if (topScore >= vectorMatchProperties.verificationStrictMinEvidence() && !rag.matches().isEmpty()) {
            // Evidence from curriculum collection
            evidenceSource = rag.matches().stream()
                    .limit(3)
                    .map(m -> (String) m.metadata().getOrDefault("text", ""))
                    .filter(t -> !t.isBlank())
                    .collect(Collectors.joining("\n---\n"));
        } else {
            // Fallback: use local context
            evidenceSource = context.length() > 2000 ? context.substring(0, 2000) : context;
            topScore       = 0.0; // reset — we're using fallback, not curriculum score
        }

        // Fast path: very high match score → SUPPORTED, skip LLM
        if (topScore >= vectorMatchProperties.verificationStrictFastPath()) {
            log.debug("[Verification/STRICT] Fast-path SUPPORTED (score={}) sentence=\"{}\"", String.format("%.3f", topScore), abbrev(sentence));
            return null; // no flag
        }

        // Slow path: gray zone → ask LLM-judge
        if (evidenceSource.isBlank()) {
            return FlaggedClaim.builder()
                    .originalSentence(sentence)
                    .reason("Không tìm thấy bằng chứng trong nguồn tham chiếu.")
                    .verdict(ClaimVerdict.UNVERIFIABLE)
                    .confidence(ClaimConfidence.LOW)
                    .applied(false)
                    .build();
        }

        return callLlmJudge(sentence, evidenceSource, rawText);
    }

    // ── LLM Judge ─────────────────────────────────────────────────────────────

    private FlaggedClaim callLlmJudge(String sentence, String evidence, String rawText) {
        String systemPrompt = """
                Bạn là AI kiểm tra tính chính xác thông tin trong tài liệu giáo dục.
                Nhiệm vụ: Đánh giá xem câu dưới đây có được hỗ trợ bởi bằng chứng từ nguồn tham chiếu không.
                
                Trả về JSON CHÍNH XÁC theo định dạng sau (không giải thích thêm):
                {
                  "verdict": "SUPPORTED" | "CONTRADICTED" | "UNVERIFIABLE",
                  "confidence": "HIGH" | "MEDIUM" | "LOW",
                  "evidenceFromSource": "trích dẫn ngắn từ bằng chứng hỗ trợ hoặc mâu thuẫn",
                  "suggestedReplacement": "câu thay thế chính xác hơn (null nếu SUPPORTED)"
                }
                
                RULES:
                - evidenceFromSource: PHẢI là trích dẫn thực từ bằng chứng được cung cấp, không bịa.
                - suggestedReplacement: chỉ điền nếu CONTRADICTED hoặc UNVERIFIABLE, null nếu SUPPORTED.
                - verdict SUPPORTED: câu khớp với bằng chứng.
                - verdict CONTRADICTED: câu mâu thuẫn rõ ràng với bằng chứng.
                - verdict UNVERIFIABLE: không đủ bằng chứng để xác nhận hoặc bác bỏ.
                """;

        String userContent = String.format("""
                CÂU CẦN KIỂM TRA:
                "%s"
                
                BẰNG CHỨNG TỪ NGUỒN THAM CHIẾU:
                %s
                """, sentence, evidence);

        try {
            String rawResponse = llmApiClient.chat(
                    List.of(LlmMessage.system(systemPrompt), LlmMessage.user(userContent)),
                    0.1, // low temperature for factual judgment
                    512
            );

            return parseLlmJudgeResponse(rawResponse, sentence, evidence, rawText);

        } catch (Exception e) {
            log.warn("[Verification/STRICT/LLM] Judge call failed: {}", e.getMessage());
            return FlaggedClaim.builder()
                    .originalSentence(sentence)
                    .reason("LLM-judge call failed: " + e.getMessage())
                    .verdict(ClaimVerdict.UNVERIFIABLE)
                    .confidence(ClaimConfidence.LOW)
                    .applied(false)
                    .build();
        }
    }

    @SuppressWarnings("unchecked")
    private FlaggedClaim parseLlmJudgeResponse(String raw, String sentence, String evidence, String rawText) {
        try {
            String cleaned = raw.replaceAll("(?s)```json\\s*", "").replaceAll("```", "").strip();
            Map<String, Object> resp = MAPPER.readValue(cleaned, Map.class);

            String verdictStr     = getString(resp, "verdict");
            String confidenceStr  = getString(resp, "confidence");
            String evidenceFromSrc = getString(resp, "evidenceFromSource");
            String suggested      = getString(resp, "suggestedReplacement");

            ClaimVerdict verdict = parseEnum(ClaimVerdict.class, verdictStr, ClaimVerdict.UNVERIFIABLE);
            ClaimConfidence conf = parseEnum(ClaimConfidence.class, confidenceStr, ClaimConfidence.LOW);

            // Don't flag SUPPORTED sentences — they're clean
            if (verdict == ClaimVerdict.SUPPORTED && conf != ClaimConfidence.LOW) {
                return null;
            }

            // Ground-truth check: verify LLM-cited evidence is real (not hallucinated)
            boolean evidenceGrounded = isEvidenceGrounded(evidenceFromSrc, evidence, rawText);
            if (!evidenceGrounded) {
                log.warn("[Verification/STRICT/LLM] Evidence not grounded in source — downgrading confidence. sentence=\"{}\"", abbrev(sentence));
                conf = ClaimConfidence.LOW;
                evidenceFromSrc = null; // don't show hallucinated evidence to user
            }

            return FlaggedClaim.builder()
                    .originalSentence(sentence)
                    .reason(buildReason(verdict, evidenceGrounded))
                    .evidenceFromSource(evidenceFromSrc)
                    .suggestedReplacement("null".equals(suggested) ? null : suggested)
                    .verdict(verdict)
                    .confidence(conf)
                    .applied(false)
                    .build();

        } catch (Exception e) {
            log.warn("[Verification/STRICT/LLM] Failed to parse judge response: {} | raw='{}'", e.getMessage(), raw.length() > 200 ? raw.substring(0, 200) : raw);
            return FlaggedClaim.builder()
                    .originalSentence(sentence)
                    .reason("Không thể phân tích phản hồi của LLM-judge.")
                    .verdict(ClaimVerdict.UNVERIFIABLE)
                    .confidence(ClaimConfidence.LOW)
                    .applied(false)
                    .build();
        }
    }

    // ── Numeric check ─────────────────────────────────────────────────────────

    private List<FlaggedClaim> numericCheck(String content, String sourceText) {
        List<FlaggedClaim> flags = new ArrayList<>();
        var matcher = NUMERIC_PATTERN.matcher(content);

        int total = 0, missing = 0;
        List<String> missingNums = new ArrayList<>();

        while (matcher.find()) {
            String num = matcher.group();
            total++;
            if (!sourceText.contains(num)) {
                missing++;
                missingNums.add(num);
            }
        }

        if (total > 0 && missing > 0) {
            double ratio = (double) missing / total;
            // STRICT: flag if any significant ratio of numbers not in source
            if (ratio > 0.25) {
                flags.add(FlaggedClaim.builder()
                        .originalSentence("[NUMERIC CHECK]")
                        .reason(String.format("Phát hiện %d/%d số liệu không có trong tài liệu gốc: %s",
                                missing, total, missingNums.subList(0, Math.min(5, missingNums.size()))))
                        .verdict(ClaimVerdict.UNVERIFIABLE)
                        .confidence(ratio > 0.5 ? ClaimConfidence.HIGH : ClaimConfidence.MEDIUM)
                        .applied(false)
                        .build());
            }
        }

        return flags;
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private ScriptNodeVerification createPending(ScriptNode node) {
        return verificationRepository.save(
                ScriptNodeVerification.builder()
                        .scriptNode(node)
                        .status(VerificationStatus.PENDING)
                        .flaggedClaims(List.of())
                        .build()
        );
    }

    private String extractNodeContent(ScriptNode node) {
        if (node.getSettings() == null) return "";
        Object rawContent = node.getSettings().get("node_content");
        if (rawContent instanceof List<?> list) {
            return list.stream().map(Object::toString).collect(Collectors.joining(" "));
        }
        if (rawContent instanceof String s) return s;
        return "";
    }

    private List<String> splitSentences(String text) {
        if (text == null || text.isBlank()) return List.of();
        return Arrays.stream(SENTENCE_SPLIT.split(text))
                .map(String::strip)
                .filter(s -> s.length() >= 10)
                .collect(Collectors.toList());
    }

    /**
     * Ground-truth check: verify the LLM-cited evidence snippet actually appears
     * in the retrieved evidence or raw source text (prevents judge hallucination).
     */
    private boolean isEvidenceGrounded(String cited, String evidence, String rawText) {
        if (cited == null || cited.isBlank()) return true; // nothing to verify
        String citedNorm = normalize(cited);
        if (normalize(evidence).contains(citedNorm)) return true;
        if (rawText != null && normalize(rawText).contains(citedNorm)) return true;
        // Fuzzy: check if at least 60% of cited words appear in evidence
        String[] words = citedNorm.split("\\s+");
        if (words.length < 3) return false;
        long matches = Arrays.stream(words)
                .filter(w -> w.length() > 2)
                .filter(w -> normalize(evidence).contains(w))
                .count();
        return matches >= Math.ceil(words.length * 0.6);
    }

    private double cosineSimilarity(float[] a, float[] b) {
        if (a == null || b == null || a.length != b.length || a.length == 0) return 0.0;
        double dot = 0, normA = 0, normB = 0;
        for (int i = 0; i < a.length; i++) {
            dot  += a[i] * b[i];
            normA += a[i] * a[i];
            normB += b[i] * b[i];
        }
        return (normA == 0 || normB == 0) ? 0.0 : dot / (Math.sqrt(normA) * Math.sqrt(normB));
    }

    private String normalize(String s) {
        return s.toLowerCase().replaceAll("[^\\w\\s]", " ").replaceAll("\\s+", " ").strip();
    }

    private String abbrev(String s) {
        return s.length() > 80 ? s.substring(0, 80) + "…" : s;
    }

    private String getString(Map<String, Object> m, String key) {
        Object v = m.get(key);
        return v != null ? v.toString() : null;
    }

    private <E extends Enum<E>> E parseEnum(Class<E> cls, String value, E fallback) {
        if (value == null) return fallback;
        try { return Enum.valueOf(cls, value.toUpperCase()); }
        catch (IllegalArgumentException e) { return fallback; }
    }

    private String buildReason(ClaimVerdict verdict, boolean evidenceGrounded) {
        return switch (verdict) {
            case CONTRADICTED   -> "Câu này mâu thuẫn với bằng chứng từ nguồn tham chiếu.";
            case UNVERIFIABLE   -> evidenceGrounded
                    ? "Không đủ bằng chứng để xác nhận câu này."
                    : "Câu này không thể xác minh — bằng chứng LLM trích dẫn không khớp nguồn.";
            case SUPPORTED      -> "Câu được hỗ trợ bởi nguồn tham chiếu (confidence thấp).";
        };
    }
}
