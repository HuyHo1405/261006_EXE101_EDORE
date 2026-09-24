package com.edore.backend.features.script.dto.response;

import com.edore.backend.features.activity.enums.StepRole;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record ScriptNodeResponseDTO(
        Long id,
        UUID scriptId,
        String nodeTypeCode,
        String nodeTypeName,
        Long activityId,
        String activityTitle,
        List<String> activityStepTemplate,
        List<StepRole> activityStepRoles,
        List<String> activityMaterials,
        Integer orderIndex,
        String appliedActivityCode,
        Boolean isCustomActivity,
        Map<String, Object> settings
) {}


