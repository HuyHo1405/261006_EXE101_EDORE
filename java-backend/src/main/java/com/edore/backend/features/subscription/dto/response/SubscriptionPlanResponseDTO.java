package com.edore.backend.features.subscription.dto.response;

import lombok.Builder;

import java.math.BigDecimal;

@Builder
public record SubscriptionPlanResponseDTO(
        Long id,
        String name,
        String description,
        BigDecimal price,
        Integer durationDays,
        Boolean isActive
) {}
