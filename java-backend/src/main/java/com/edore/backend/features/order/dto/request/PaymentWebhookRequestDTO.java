package com.edore.backend.features.order.dto.request;

import java.math.BigDecimal;

public record PaymentWebhookRequestDTO(
        String orderCode,
        BigDecimal amount,
        String status,
        String transactionId,
        String signature,
        String rawBody,
        String provider,
        String code,
        String desc,
        PayOSWebhookData data
) {
    public record PayOSWebhookData(
            Object orderCode,
            BigDecimal amount,
            String description,
            String accountNumber,
            String reference,
            String transactionDateTime,
            String currency,
            String paymentLinkId,
            String code,
            String desc
    ) {}

    public String getEffectiveOrderCode() {
        if (orderCode != null && !orderCode.isBlank()) {
            return orderCode;
        }
        if (transactionId != null && !transactionId.isBlank()) {
            return transactionId;
        }
        if (data != null && data.orderCode() != null) {
            return String.valueOf(data.orderCode());
        }
        return null;
    }

    public BigDecimal getEffectiveAmount() {
        if (amount != null) {
            return amount;
        }
        if (data != null && data.amount() != null) {
            return data.amount();
        }
        return BigDecimal.ZERO;
    }

    public String getEffectiveStatus() {
        if (status != null && !status.isBlank()) {
            return status.toUpperCase();
        }
        if ("00".equals(code) || (data != null && "00".equals(data.code()))) {
            return "SUCCESS";
        }
        return "FAILED";
    }

    public String getEffectiveProvider() {
        return (provider != null && !provider.isBlank()) ? provider.trim().toUpperCase() : "PAYOS";
    }
}
