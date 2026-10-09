package com.edore.backend.features.ai.service;

import com.edore.backend.features.ai.dto.response.ScriptResultDto;
import java.util.UUID;

/**
 * Top-level AI pipeline orchestrator:
 * extract → chunk → score activities → build prompt → call LLM → parse → persist.
 */
public interface AiPipelineService {


    ScriptResultDto generateScriptFromLesson(
            String lessonId,
            Long templateId,
            UUID courseId,
            String scriptTitle,
            Boolean enableFactCheck
    );

    void generateScriptAsync(
            String jobId,
            String lessonId,
            Long templateId,
            UUID courseId,
            String scriptTitle,
            String learningOutcome,
            Boolean enableFactCheck,
            UUID userId
    );

    void validateGenerationParams(Long templateId, UUID courseId);
}
