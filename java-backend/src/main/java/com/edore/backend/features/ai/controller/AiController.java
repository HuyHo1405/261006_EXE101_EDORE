package com.edore.backend.features.ai.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.dto.response.ScriptResultDto;
import com.edore.backend.features.ai.service.AiPipelineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/ai")
@Tag(   name = "7. AI APIs", 
        description = "AI Pedagogy Pipeline — generate lesson scripts from uploaded files")
@RequiredArgsConstructor
public class AiController {

    private final AiPipelineService aiPipelineService;

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
    public ResponseEntity<ApiResponse<ScriptResultDto>> generateScript(

            @Parameter(description = "Lesson content file (PDF/DOCX/TXT/MD, max 150KB)", required = true)
            @RequestParam("file") MultipartFile file,

            @Parameter(description = "Template ID (1 = 3-node, 2 = 4-node)", required = true)
            @RequestParam("templateId") Long templateId,

            @Parameter(description = "Course UUID (ClassConfig is retrieved automatically from course)", required = true)
            @RequestParam("courseId") UUID courseId,

            @Parameter(description = "Optional learning outcome / objective hint for AI")
            @RequestParam(value = "learningOutcome", required = false) String learningOutcome,

            @Parameter(description = "Optional override for fact-check verification (true/false). If omitted, defaults to user settings.")
            @RequestParam(value = "enableFactCheck", required = false) Boolean enableFactCheck
    ) {
        log.info("[AiController] generateScript: file='{}' size={}KB templateId={} courseId={} enableFactCheck={}",
                file.getOriginalFilename(),
                file.getSize() / 1024,
                templateId, courseId, enableFactCheck);

        ScriptResultDto result = aiPipelineService.generateScript(
                file, templateId, courseId, learningOutcome, enableFactCheck);

        return ResponseEntity.ok(ApiResponse.of(AiResponseCode.SCRIPT_GENERATED, result));
    }
}
