package com.edore.backend.features.ai.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.dto.response.ScriptResultDto;
import com.edore.backend.features.ai.service.AiPipelineService;
import com.edore.backend.features.ai.dto.response.AiJobStatus;
import com.edore.backend.features.ai.service.AiJobService;
import com.edore.backend.features.ai.service.FileExtractService;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.repository.UserRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;
import java.util.concurrent.RejectedExecutionException;

@Slf4j
@RestController
@RequestMapping("/api/v1/ai")
@Tag(   name = "08. AI APIs", 
        description = "AI Pedagogy Pipeline — generate lesson scripts from uploaded files")
@RequiredArgsConstructor
public class AiController {

    private final AiPipelineService aiPipelineService;
    private final AiJobService aiJobService;
    private final FileExtractService fileExtractService;
    private final UserRepository userRepository;

    @Operation( summary = "1. Generate lesson script from file",
                description = """
                    Upload a lesson content file (PDF, DOCX, TXT, MD ≤ 150KB),
                    select a template and course (classroom configuration is automatically fetched from the 1-1 course setup),
                    then let AI generate and persist a full pedagogical script.
                    
                    **Pipeline steps:**
                    1. Extract text from file
                    2. Semantic chunk + TF-IDF context retrieval per node
                    3. Score activities from DB by classroom context (from course.classConfig)
                    4. Build prompt → call Beeknoee LLM API
                    5. Parse JSON response
                    6. Save Script + ScriptNodes to database
                    """,
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PostMapping(value = "/pedagogy", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<AiJobStatus>> generateScript(

            @Parameter(description = "Lesson content file (Optional if topic is provided)", required = false)
            @RequestParam(value = "file", required = false) MultipartFile file,

            @Parameter(description = "Topic to generate from curriculum if no file is provided", required = false)
            @RequestParam(value = "topic", required = false) String topic,

            @Parameter(description = "Template ID (1 = 3-node, 2 = 4-node)", required = true)
            @RequestParam("templateId") Long templateId,

            @Parameter(description = "Course UUID (ClassConfig is retrieved automatically from course)", required = true)
            @RequestParam("courseId") UUID courseId,

            @Parameter(description = "Optional script title")
            @RequestParam(value = "scriptTitle", required = false) String scriptTitle,

            @Parameter(description = "Optional title alias")
            @RequestParam(value = "title", required = false) String title,

            @Parameter(description = "Optional learning outcome / objective hint for AI")
            @RequestParam(value = "learningOutcome", required = false) String learningOutcome,

            @Parameter(description = "Optional override for fact-check verification (true/false). If omitted, defaults to user settings.")
            @RequestParam(value = "enableFactCheck", required = false) Boolean enableFactCheck
    ) {
        String effectiveTitle = (scriptTitle != null && !scriptTitle.isBlank()) ? scriptTitle : title;

        log.info("[AiController] generateScript: file='{}' size={}KB templateId={} courseId={} title='{}' enableFactCheck={}",
                file.getOriginalFilename(),
                file.getSize() / 1024,
                templateId, courseId, effectiveTitle, enableFactCheck);

        // Resolve authenticated userId
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userRepository.findByUsername(auth.getName())
                .map(u -> u.getId())
                .orElse(null);

        // Guard: 1 active job per user (skip for null userId — shouldn't happen in secured endpoint)
        if (userId != null && !aiJobService.tryAcquireUserSlot(userId)) {
            throw new ApiException(AiResponseCode.USER_HAS_ACTIVE_JOB);
        }

        // Validate inputs early before expensive file processing and async job creation
        aiPipelineService.validateGenerationParams(templateId, courseId);

        // Extract file text synchronously or use topic
        String rawText = "";
        if (file != null && !file.isEmpty()) {
            rawText = fileExtractService.extract(file);
        } else if (topic != null && !topic.isBlank()) {
            rawText = topic; // AI Pipeline will use this to query Vector DB for SGK content
        }

        if (rawText == null || rawText.isBlank()) {
            if (userId != null) aiJobService.releaseUserSlot(userId);
            throw new ApiException(AiResponseCode.EMPTY_EXTRACTED_TEXT);
        }

        // Create job
        String jobId = UUID.randomUUID().toString();
        AiJobStatus jobStatus = AiJobStatus.builder()
                .jobId(jobId)
                .status("PENDING")
                .progress(0)
                .build();
        aiJobService.createJob(jobStatus);

        // Start async task — catch RejectedExecutionException when generation pool is saturated
        try {
            aiPipelineService.generateScriptAsync(jobId, rawText, templateId, courseId, effectiveTitle, learningOutcome, enableFactCheck, userId);
        } catch (RejectedExecutionException e) {
            log.warn("[AiController] Generation pool saturated, rejecting jobId={}", jobId);
            aiJobService.deleteJob(jobId);
            if (userId != null) aiJobService.releaseUserSlot(userId);
            throw new ApiException(AiResponseCode.SYSTEM_BUSY);
        }

        return ResponseEntity.accepted().body(ApiResponse.of(AiResponseCode.JOB_ACCEPTED, jobStatus));
    }

    @Operation( summary = "2. Get job status",
                description = "Polling endpoint to check generation progress.",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping("/jobs/{jobId}/status")
    public ResponseEntity<ApiResponse<AiJobStatus>> getJobStatus(@PathVariable String jobId) {
        AiJobStatus status = aiJobService.getJobStatus(jobId);
        return ResponseEntity.ok(ApiResponse.of(AiResponseCode.SCRIPT_GENERATED, status));
    }
}
