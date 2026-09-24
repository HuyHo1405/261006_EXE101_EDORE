package com.edore.backend.features.order.dto.response;

import lombok.Builder;

@Builder
public record PaymentWebhookResponseDTO(
        boolean success,
        String message
) {}
