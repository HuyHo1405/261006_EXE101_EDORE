package com.edore.backend.features.order.dto.request;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CreatePaymentLinkRequestDTO(
        @NotNull(message = "Order ID is required")
        UUID orderId,

        String provider // e.g. "PAYOS", "VNPAY", "MOMO" (defaults to "PAYOS" if null/blank)
) {
    public String getEffectiveProvider() {
        return (provider != null && !provider.isBlank()) ? provider.trim().toUpperCase() : "PAYOS";
    }
}
