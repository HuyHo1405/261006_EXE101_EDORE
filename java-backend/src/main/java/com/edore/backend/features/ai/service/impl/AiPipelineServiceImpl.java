package com.edore.backend.features.ai.service.impl;

import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.client.LlmApiClient;
import com.edore.backend.features.ai.client.dto.LlmMessage;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.ai.dto.response.ScriptResultDto;
import com.edore.backend.features.ai.dto.response.AiJobStatus;
import com.edore.backend.features.ai.helper.AiPromptBuilder;
import com.edore.backend.features.ai.helper.AiResponseParser;
import com.edore.backend.features.ai.service.*;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.subscription.service.SubscriptionService;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.entity.Script;
import com.edore.backend.features.script.entity.Template;
import com.edore.backend.features.script.repository.NodeTypeRepository;
import com.edore.backend.features.script.repository.TemplateRepository;
import com.edore.backend.features.script.service.ScriptVerificationService;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.dto.ReferenceMatchResult;
import com.edore.backend.features.vector.service.VectorMatchService;
import com.edore.backend.features.script.entity.ScriptNode;
import com.edore.backend.features.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

/**
 * Orchestrates the full AI pedagogy pipeline:
 * 1. extract text from file
 * 2. semantic chunk
 * 3. input grounding (Qdrant vector check)
 * 4. per-node: retrieve top-K context
 * 5. build prompt (via AiPromptBuilder) -> call LLM
 * 6. parse & sanitize JSON output (via AiResponseParser)
 * 7. persist Script (Phase 1 complete — response returned here)
 * 8. [async] trigger ScriptVerificationService.verifyScriptAsync (Phase 2)
 *
 * <p>Phase 2 is skipped if the authenticated user has {@code enableFactCheckVerification = false}.
 * In that case, the FE should show a toast/modal prompting the user to run verification on demand.</p>
 */
@Slf4j
@Service
@EnableConfigurationProperties({VectorMatchProperties.class, LlmProperties.class})
@RequiredArgsConstructor
public class AiPipelineServiceImpl implements AiPipelineService {

    private final FileExtractService          fileExtractService;
    private final ChunkingService             chunkingService;
    private final LlmApiClient                llmApiClient;
    private final ScriptPersistService        scriptPersistService;
    private final VectorMatchService          vectorMatchService;
    private final ScriptVerificationService   scriptVerificationService;
    private final VectorMatchProperties       vectorMatchProperties;
    private final LlmProperties               llmProperties;
    private final AiJobService                aiJobService;

    private final AiPromptBuilder             aiPromptBuilder;
    private final AiResponseParser            aiResponseParser;

    private final TemplateRepository          templateRepository;
    private final CourseRepository            courseRepository;
    private final NodeTypeRepository          nodeTypeRepository;
    private final UserRepository              userRepository;
    private final UserSettingsRepository      userSettingsRepository;
    private final SubscriptionService         subscriptionService;

    @Override
    @Transactional
    public ScriptResultDto generateScript(MultipartFile file, Long templateId, UUID courseId, String scriptTitle, String learningOutcome) {
        return generateScript(file, templateId, courseId, scriptTitle, learningOutcome, null);
    }

    @Override
    @Transactional
    public ScriptResultDto generateScript(MultipartFile file, Long templateId, UUID courseId, String scriptTitle, String learningOutcome, Boolean enableFactCheck) {
        long t1 = System.currentTimeMillis();
        String rawText = fileExtractService.extract(file);
        if (rawText == null || rawText.isBlank()) {
            throw new ApiException(AiResponseCode.EMPTY_EXTRACTED_TEXT);
        }
        long extractMs = System.currentTimeMillis() - t1;
        return generateScriptInternal(rawText, extractMs, templateId, courseId, scriptTitle, learningOutcome, enableFactCheck, null);
    }

    @Override
    @Transactional(readOnly = true)
    public void validateGenerationParams(Long templateId, UUID courseId) {
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ApiException(AiResponseCode.TEMPLATE_NOT_FOUND));
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(AiResponseCode.COURSE_NOT_FOUND));
        if (course.getClassConfig() == null) {
            log.warn("[Pipeline] Course {} does not have an assigned ClassConfig", courseId);
            throw new ApiException(AiResponseCode.CLASS_CONFIG_NOT_FOUND);
        }
        if (template.getNodeTypes().isEmpty()) {
            log.warn("[Pipeline] Template {} has no node types", templateId);
            throw new ApiException(AiResponseCode.TEMPLATE_NOT_FOUND);
        }

        // Check subscription script quota synchronously so user gets immediate error
        org.springframework.security.core.Authentication auth =
                org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.isAuthenticated()) {
            userRepository.findByUsername(auth.getName()).ifPresent(user ->
                    subscriptionService.assertScriptCreationAllowed(courseId, user.getId()));
        }
    }

    @Override
    @Transactional
    @org.springframework.scheduling.annotation.Async(com.edore.backend.core.config.AsyncVerificationConfig.GENERATION_EXECUTOR)
    public void generateScriptAsync(String jobId, String rawText, Long templateId, UUID courseId, String scriptTitle, String learningOutcome, Boolean enableFactCheck, UUID userId) {
        AiJobStatus status = aiJobService.getJobStatus(jobId);
        try {
            status.setStatus("PROCESSING");
            status.setProgress(10);
            aiJobService.updateJobStatus(status);

            // Run the internal logic
            ScriptResultDto result = generateScriptInternal(rawText, 0, templateId, courseId, scriptTitle, learningOutcome, enableFactCheck, status);

            status.setStatus("COMPLETED");
            status.setProgress(100);
            status.setScriptId(result.scriptId());
            status.setResult(result);
            aiJobService.updateJobStatus(status);
        } catch (Exception e) {
            log.error("[Pipeline] Async generation failed for job {}", jobId, e);
            status.setStatus("FAILED");
            status.setErrorMessage(e.getMessage());
            aiJobService.updateJobStatus(status);
        } finally {
            // Always release the per-user Redis slot so the user can submit a new job
            if (userId != null) {
                aiJobService.releaseUserSlot(userId);
            }
        }
    }

    private ScriptResultDto generateScriptInternal(String rawText, long extractMs, Long templateId, UUID courseId, String scriptTitle, String learningOutcome, Boolean enableFactCheck, AiJobStatus jobStatus) {
        long pipelineStart = System.currentTimeMillis();

        // ── 1. Resolve template + course + classConfig ─────────────────────────
        Template template = templateRepository.findById(templateId)
                .orElseThrow(() -> new ApiException(AiResponseCode.TEMPLATE_NOT_FOUND));

        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(AiResponseCode.COURSE_NOT_FOUND));

        ClassConfig classConfig = course.getClassConfig();
        if (classConfig == null) {
            log.warn("[Pipeline] Course {} does not have an assigned ClassConfig", courseId);
            throw new ApiException(AiResponseCode.CLASS_CONFIG_NOT_FOUND);
        }

        List<NodeType> nodes = template.getNodeTypes();
        if (nodes.isEmpty()) {
            log.warn("[Pipeline] Template {} has no node types", templateId);
            throw new ApiException(AiResponseCode.TEMPLATE_NOT_FOUND);
        }

        // ── 2. Check raw text ────────────────────────────────────────────────────
        if (rawText == null || rawText.isBlank()) {
            throw new ApiException(AiResponseCode.EMPTY_EXTRACTED_TEXT);
        }
        log.info("[Pipeline] Input text length={}", rawText.length());

        if (jobStatus != null) {
            jobStatus.setProgress(20);
            aiJobService.updateJobStatus(jobStatus);
        }

        // ── 3. Chunk ───────────────────────────────────────────────────────────
        long t2 = System.currentTimeMillis();
        List<String> chunks = chunkingService.chunk(rawText);
        long chunkMs = System.currentTimeMillis() - t2;
        String keyFacts = chunkingService.extractKeyFacts(rawText);

        if (jobStatus != null) {
            jobStatus.setProgress(40);
            aiJobService.updateJobStatus(jobStatus);
        }

        // ── 3.5 Input Grounding Check (Qdrant Vector) ──────────────────────────
        long tQdrant = System.currentTimeMillis();
        ReferenceMatchResult groundingResult = vectorMatchService.findSimilarReferences(
                rawText,
                vectorMatchProperties.collectionCurriculum(),
                vectorMatchProperties.topK(),
                course.getCategories()
        );
        long qdrantMs = System.currentTimeMillis() - tQdrant;
        log.info("[Pipeline] Grounding level={} topScore={} qdrantMs={}ms",
                groundingResult.level(), groundingResult.topScore(), qdrantMs);

        // ── 4. Context per node ────────────────────────────────────────────────
        List<String> nodeCodes = nodes.stream().map(NodeType::getCode).toList();
        boolean isLargeFile = rawText.length() > llmProperties.largeFileThreshold();

        Map<String, String> contextPerNode = isLargeFile
                ? chunkingService.getContextPerNode(chunks, nodeCodes)
                : nodeCodes.stream().collect(Collectors.toMap(code -> code, code -> rawText));

        if (jobStatus != null) {
            jobStatus.setProgress(60);
            aiJobService.updateJobStatus(jobStatus);
        }

        // ── 5. Build prompt via AiPromptBuilder ────────────────────────────────
        String systemPrompt = aiPromptBuilder.buildSystemPrompt(nodes, classConfig, learningOutcome, groundingResult.level());
        String userContent  = aiPromptBuilder.buildUserContent(nodes, contextPerNode, classConfig, learningOutcome, keyFacts, course);

        List<LlmMessage> messages = List.of(
                LlmMessage.system(systemPrompt),
                LlmMessage.user(userContent)
        );

        // ── 6. Call LLM with Retry & Parse via AiResponseParser ────────────────
        long t3 = System.currentTimeMillis();
        List<ScriptNodeResultDto> nodeResults = callAndParseWithRetry(messages, nodes);
        long aiMs = System.currentTimeMillis() - t3;

        if (jobStatus != null) {
            jobStatus.setProgress(90);
            aiJobService.updateJobStatus(jobStatus);
        }

        // ── 7. Persist (Phase 1 complete) ─────────────────────────────────────
        SaveScriptResult saved = scriptPersistService.saveScript(courseId, template, nodes, nodeResults, scriptTitle);
        Script script          = saved.script();

        long totalMs = System.currentTimeMillis() - pipelineStart;
        log.info("[Pipeline] DONE Phase1 — scriptId={} total={}ms", script.getId(), totalMs);

        // ── 8. Trigger async verification (Phase 2) — request override or user settings ─
        triggerAsyncVerificationIfEnabled(script.getId(), saved.savedNodes(), contextPerNode, rawText, enableFactCheck);

        return new ScriptResultDto(
                script.getId(),
                script.getTitle(),
                templateId,
                nodeResults,
                groundingResult.level(),
                groundingResult.topScore(),
                new ScriptResultDto.PipelineStats(
                        rawText.length(), chunks.size(), nodeResults.size(),
                        extractMs, chunkMs, qdrantMs, aiMs, totalMs
                )
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    private void triggerAsyncVerificationIfEnabled(UUID scriptId,
                                                    List<ScriptNode> savedNodes,
                                                    Map<String, String> contextPerNode,
                                                    String rawText,
                                                    Boolean requestOverride) {
        try {
            boolean enabled = requestOverride != null ? requestOverride : resolveFactCheckToggle();
            if (!enabled) {
                log.info("[Pipeline] Fact-check verification SKIPPED (toggle OFF) for scriptId={}", scriptId);
                return;
            }
            log.info("[Pipeline] Triggering async Phase 2 verification for scriptId={} nodes={}", scriptId, savedNodes.size());
            scriptVerificationService.verifyScriptAsync(scriptId, savedNodes, contextPerNode, rawText);
        } catch (Exception e) {
            // Phase 2 failure must never break the Phase 1 response
            log.error("[Pipeline] Failed to trigger async verification for scriptId={}: {}", scriptId, e.getMessage(), e);
        }
    }

    /**
     * Reads the authenticated user's {@code UserSettings.enableFactCheckVerification} preference.
     * Defaults to {@code true} if the user/settings cannot be resolved.
     */
    private boolean resolveFactCheckToggle() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return true;
            String username = auth.getName();
            return userRepository.findByUsername(username)
                    .flatMap(u -> userSettingsRepository.findById(u.getId()))
                    .map(s -> Boolean.TRUE.equals(s.getEnableFactCheckVerification()))
                    .orElse(true);
        } catch (Exception e) {
            log.warn("[Pipeline] Could not resolve fact-check toggle, defaulting ON: {}", e.getMessage());
            return true;
        }
    }

    private List<ScriptNodeResultDto> callAndParseWithRetry(List<LlmMessage> messages, List<NodeType> nodes) {
        for (int attempt = 1; attempt <= 2; attempt++) {
            try {
                String rawContent = llmApiClient.chat(messages, llmProperties.temperature(), llmProperties.maxTokens());
                return aiResponseParser.parseAiResponse(rawContent, nodes);
            } catch (ApiException e) {
                if (attempt == 2) {
                    log.error("[Pipeline] LLM parse failed on retry attempt {}: {}", attempt, e.getMessage());
                    throw e;
                }
                log.warn("[Pipeline] LLM response invalid or node count mismatched on attempt {}. Retrying...", attempt);
            }
        }
        throw new ApiException(AiResponseCode.JSON_PARSE_ERROR);
    }
}
