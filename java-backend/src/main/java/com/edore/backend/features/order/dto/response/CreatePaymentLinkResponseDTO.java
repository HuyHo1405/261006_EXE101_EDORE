package com.edore.backend.features.order.dto.response;

import lombok.Builder;

import java.math.BigDecimal;
import java.time.Instant;

@Builder
public record CreatePaymentLinkResponseDTO(
        String paymentLinkUrl,
        String qrCodeUrl,
        BigDecimal amount,
        String orderCode,
        Instant expiredAt
) {}
