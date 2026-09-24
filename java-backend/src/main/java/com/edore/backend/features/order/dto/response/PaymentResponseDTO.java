package com.edore.backend.features.order.dto.response;

import com.edore.backend.features.order.model.PaymentStatus;
import com.fasterxml.jackson.annotation.JsonInclude;
import io.swagger.v3.oas.annotations.media.Schema;
import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public record PaymentResponseDTO(
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID id,

        @Schema(example = "550e8400-e29b-41d4-a716-446655440001")
        UUID orderId,

        @Schema(example = "550e8400-e29b-41d4-a716-446655440002")
        UUID userId,

        @Schema(example = "1")
        Long subscriptionPlanId,

        @Schema(example = "Gói Pro 1 Tháng")
        String subscriptionPlanName,

        @Schema(example = "PAYOS")
        String provider,

        @Schema(example = "PAYOS-12345678")
        String transactionId,

        @Schema(example = "199000.00")
        BigDecimal amount,

        @Schema(example = "SUCCESS")
        PaymentStatus status,

        Instant paidAt,

        Instant createdAt
) {}
