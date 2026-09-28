package com.edore.backend.features.subscription.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.util.List;

@Builder
public record SubscriptionPlanResponseDTO(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer durationDays,
        Integer maxCourses,
        Integer maxStudentsPerClass,
        Boolean isActive,
        List<String> features
) {}
