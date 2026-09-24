package com.edore.backend.features.activity.dto.response;

import java.util.List;

public record ActivityResponseDTO(
        Long id,
        String code,
        String title,
        String content,
        List<String> defaultMaterials,
        List<String> defaultStepTemplate
) {}

