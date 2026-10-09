package com.edore.backend.features.ai.dto.response;

import java.util.List;
import java.util.Map;

public record AiParsedResult(
        Map<String, Object> lessonMeta,
        List<ScriptNodeResultDto> nodes
) {}
