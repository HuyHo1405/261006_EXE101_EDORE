package com.edore.backend.features.script.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.script.dto.ScriptNodeVerificationDto;
import com.edore.backend.features.script.entity.ScriptNodeVerification;
import com.edore.backend.features.script.repository.ScriptNodeRepository;
import com.edore.backend.features.script.repository.ScriptNodeVerificationRepository;
import com.edore.backend.features.script.service.ScriptVerificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * Endpoints for the async fact-check verification pipeline (Phase 2).
 *
 * <ul>
 *   <li>{@code GET  /scripts/{scriptId}/verification-stream} — SSE stream of per-node results</li>
 *   <li>{@code PATCH /scripts/{scriptId}/nodes/{nodeId}/apply-suggestion} — apply a FlaggedClaim suggestion</li>
 *   <li>{@code POST  /scripts/{scriptId}/nodes/{nodeId}/re-verify} — trigger re-verification</li>
 *   <li>{@code GET   /scripts/{scriptId}/verifications} — snapshot of all verification results</li>
 * </ul>
 */
@Slf4j
@RestController
@RequestMapping("/api/scripts")
@Tag(name = "A7. Script Verification APIs", description = "Fact-check verification pipeline for AI-generated lesson scripts")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class ScriptVerificationController {

    private final ScriptNodeVerificationRepository verificationRepository;
    private final ScriptNodeRepository             scriptNodeRepository;
    private final ScriptVerificationService        verificationService;

    // ── SSE Stream ────────────────────────────────────────────────────────────

    @Operation(
        summary     = "Stream verification results via SSE",
        description = "Opens a Server-Sent Events stream. Polls the DB every 2s and pushes each node's " +
                      "verification result as it becomes DONE or FAILED. Closes when all nodes are settled."
    )
    @GetMapping(value = "/{scriptId}/verification-stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamVerification(@PathVariable UUID scriptId) {
        // 5-minute timeout — enough for any typical verify run
        SseEmitter emitter = new SseEmitter(5 * 60 * 1000L);

        ExecutorService sse = Executors.newSingleThreadExecutor();
        sse.execute(() -> {
            try {
                int maxPolls = 150; // 5min at 2s interval
                int poll     = 0;

                while (poll++ < maxPolls) {
                    List<ScriptNodeVerification> verifications =
                            verificationRepository.findByScriptIdOrderByNodeIndex(scriptId);

                    if (verifications.isEmpty()) {
                        emitter.send(SseEmitter.event().name("info").data("Verification not started yet"));
                        Thread.sleep(2000);
                        continue;
                    }

                    boolean allSettled = true;
                    for (ScriptNodeVerification v : verifications) {
                        if (v.getStatus() == ScriptNodeVerification.VerificationStatus.PENDING
                                || v.getStatus() == ScriptNodeVerification.VerificationStatus.RUNNING) {
                            allSettled = false;
                        }

                        // Push each node result as an SSE event
                        ScriptNodeVerificationDto dto = toDto(v);
                        String nodeCode = v.getScriptNode().getNodeType() != null
                                ? v.getScriptNode().getNodeType().getCode()
                                : "unknown";

                        emitter.send(SseEmitter.event()
                                .name("node-verified")
                                .id(String.valueOf(v.getId()))
                                .data(Map.of(
                                        "nodeId",   v.getScriptNode().getId(),
                                        "nodeCode", nodeCode,
                                        "result",   dto
                                )));
                    }

                    if (allSettled) {
                        emitter.send(SseEmitter.event().name("done").data("All nodes verified"));
                        break;
                    }

                    Thread.sleep(2000);
                }
                emitter.complete();
            } catch (IOException | InterruptedException e) {
                log.warn("[SSE] Stream interrupted for scriptId={}: {}", scriptId, e.getMessage());
                emitter.completeWithError(e);
            }
        });

        emitter.onTimeout(()  -> { sse.shutdown(); log.warn("[SSE] Timeout for scriptId={}", scriptId); });
        emitter.onCompletion(() -> sse.shutdown());

        return emitter;
    }

    // ── Snapshot GET ──────────────────────────────────────────────────────────

    @Operation(summary = "Get all verification results for a script (snapshot)")
    @GetMapping("/{scriptId}/verifications")
    public ResponseEntity<ApiResponse<List<ScriptNodeVerificationDto>>> getVerifications(
            @PathVariable UUID scriptId) {

        List<ScriptNodeVerificationDto> results = verificationRepository
                .findByScriptIdOrderByNodeIndex(scriptId)
                .stream()
                .map(this::toDto)
                .toList();

        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, results));
    }

    // ── Apply Suggestion ──────────────────────────────────────────────────────

    @Operation(
        summary     = "Apply a suggested replacement for a flagged claim",
        description = "Marks the specific FlaggedClaim as applied=true and updates the corresponding " +
                      "sentence in ScriptNode.settings.node_content. User is trusted — no re-verify triggered."
    )
    @PatchMapping("/{scriptId}/nodes/{nodeId}/apply-suggestion")
    public ResponseEntity<ApiResponse<Void>> applySuggestion(
            @PathVariable UUID scriptId,
            @PathVariable Long nodeId,
            @RequestBody ApplySuggestionRequest request) {

        ScriptNodeVerification verification = verificationRepository
                .findByScriptNodeId(nodeId)
                .orElse(null);

        if (verification == null || verification.getFlaggedClaims() == null) {
            return ResponseEntity.notFound().build();
        }

        var claims = verification.getFlaggedClaims();
        boolean applied = false;

        for (int i = 0; i < claims.size(); i++) {
            var claim = claims.get(i);
            if (claim.getOriginalSentence().equals(request.originalSentence())
                    && !claim.isApplied()) {

                // Replace the claim with applied=true version
                claims.set(i, ScriptNodeVerification.FlaggedClaim.builder()
                        .originalSentence(claim.getOriginalSentence())
                        .reason(claim.getReason())
                        .evidenceFromSource(claim.getEvidenceFromSource())
                        .suggestedReplacement(claim.getSuggestedReplacement())
                        .verdict(claim.getVerdict())
                        .confidence(claim.getConfidence())
                        .applied(true)
                        .build());
                applied = true;
                break;
            }
        }

        if (!applied) {
            return ResponseEntity.badRequest().build();
        }

        // Apply suggestion to ScriptNode.settings.node_content
        scriptNodeRepository.findById(nodeId).ifPresent(node -> {
            if (node.getSettings() != null && request.suggestedReplacement() != null) {
                Object content = node.getSettings().get("node_content");
                if (content instanceof List<?> list) {
                    @SuppressWarnings("unchecked")
                    List<String> contentList = (List<String>) list;
                    List<String> updated = contentList.stream()
                            .map(line -> line.contains(request.originalSentence())
                                    ? line.replace(request.originalSentence(), request.suggestedReplacement())
                                    : line)
                            .toList();
                    node.getSettings().put("node_content", updated);
                    scriptNodeRepository.save(node);
                }
            }
        });

        verificationRepository.save(verification);

        log.info("[Verification] Applied suggestion for scriptId={} nodeId={} sentence='{}'",
                scriptId, nodeId, request.originalSentence().length() > 60
                        ? request.originalSentence().substring(0, 60) + "…"
                        : request.originalSentence());

        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS));
    }

    // ── Re-verify ─────────────────────────────────────────────────────────────

    @Operation(
        summary     = "Trigger re-verification for a single node",
        description = "Useful after user manually edits node content. Runs in the same async pool as initial verify."
    )
    @PostMapping("/{scriptId}/nodes/{nodeId}/re-verify")
    public ResponseEntity<ApiResponse<Void>> reVerify(
            @PathVariable UUID scriptId,
            @PathVariable Long nodeId,
            @RequestBody(required = false) ReVerifyRequest request) {

        Map<String, String> context = request != null && request.contextPerNode() != null
                ? request.contextPerNode()
                : Map.of();
        String rawText = request != null ? request.rawText() : null;

        verificationService.reVerifyNode(nodeId, context, rawText);
        log.info("[Verification] Re-verify triggered for scriptId={} nodeId={}", scriptId, nodeId);

        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS));
    }

    // ── Request/Response types ────────────────────────────────────────────────

    public record ApplySuggestionRequest(
            String originalSentence,
            String suggestedReplacement
    ) {}

    public record ReVerifyRequest(
            Map<String, String> contextPerNode,
            String rawText
    ) {}

    // ── Mapper ────────────────────────────────────────────────────────────────

    private ScriptNodeVerificationDto toDto(ScriptNodeVerification v) {
        return new ScriptNodeVerificationDto(
                v.getId(),
                v.getStatus(),
                v.getStrictness(),
                v.getFlaggedClaims() != null ? v.getFlaggedClaims() : List.of(),
                v.getVerifiedAt(),
                v.getErrorMessage()
        );
    }
}
