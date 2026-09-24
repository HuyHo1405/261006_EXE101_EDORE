package com.edore.backend.features.order.service;

import com.edore.backend.features.order.dto.response.CreatePaymentLinkResponseDTO;

import java.math.BigDecimal;

public interface PaymentGatewayProvider {

    String getProviderName();

    CreatePaymentLinkResponseDTO createPaymentLink(String orderCode, BigDecimal amount, String description);

    boolean verifyWebhookSignature(String rawPayload, String signature);

    default String getPaymentStatus(String orderCode) {
        return "UNKNOWN";
    }
}
