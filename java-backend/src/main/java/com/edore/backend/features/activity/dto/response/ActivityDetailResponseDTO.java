package com.edore.backend.features.activity.dto.response;

import com.edore.backend.features.script.model.NodeTypeEnum;

import java.time.Instant;
import java.util.List;

public record ActivityDetailResponseDTO(
        Long id,
        String code,
        String title,
        String content,
        Integer maxScore,

        List<String> defaultMaterials,
        List<String> defaultStepTemplate,

        List<String> allowedDuration,
        List<String> allowedClassSize,
        List<String> allowedSpace,
        List<String> allowedSeatingLayout,
        List<String> requiredInfrastructure,
        List<String> requiredDevices,

        List<NodeTypeSummary> nodeTypes,
        Instant createdAt
) {
    public record NodeTypeSummary(NodeTypeEnum id, String code, String name) {}
}

