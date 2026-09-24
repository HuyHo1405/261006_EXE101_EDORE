package com.edore.backend.features.ai.service;

import com.edore.backend.features.ai.dto.response.ScriptResultDto;
import org.springframework.web.multipart.MultipartFile;

import java.util.UUID;

/**
 * Top-level AI pipeline orchestrator:
 * extract → chunk → score activities → build prompt → call LLM → parse → persist.
 */
public interface AiPipelineService {

    ScriptResultDto generateScript(
            MultipartFile file,
            Long templateId,
            UUID courseId,
            String learningOutcome
    );

    ScriptResultDto generateScript(
            MultipartFile file,
            Long templateId,
            UUID courseId,
            String learningOutcome,
            Boolean enableFactCheck
    );
}
