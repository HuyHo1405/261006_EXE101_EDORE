package com.edore.backend.features.order.dto.response;

import com.edore.backend.features.order.model.OrderStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record OrderResponseDTO(
        UUID id,
        UUID userId,
        Long subscriptionPlanId,
        String subscriptionPlanName,
        BigDecimal amount,
        OrderStatus status,
        Long gatewayOrderCode,
        Instant createdAt,
        Instant updatedAt
) {}
