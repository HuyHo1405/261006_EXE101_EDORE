package com.edore.backend.features.order.dto.request;

import jakarta.validation.constraints.NotNull;

public record OrderCreateRequestDTO(
        @NotNull(message = "Subscription plan ID is required")
        Long subscriptionPlanId
) {}
