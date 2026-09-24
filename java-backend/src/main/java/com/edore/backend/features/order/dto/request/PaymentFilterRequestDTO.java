package com.edore.backend.features.order.dto.request;

import com.edore.backend.features.order.model.PaymentStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

public record PaymentFilterRequestDTO(
        @Schema(description = "Payment status filter (PENDING, SUCCESS, FAILED, REFUNDED)", example = "SUCCESS")
        PaymentStatus status,

        @Schema(description = "Payment provider filter", example = "PAYOS")
        String provider,

        @Schema(description = "Order ID filter", example = "550e8400-e29b-41d4-a716-446655440001")
        UUID orderId,

        @Schema(description = "Filter by user ID (Admin only)", example = "550e8400-e29b-41d4-a716-446655440002")
        UUID userId,

        @Schema(description = "Keyword search (transactionId, gatewayOrderCode, user email or username)", example = "PAYOS-12345678")
        String search,

        @Schema(description = "Filter payments created from timestamp")
        Instant fromDate,

        @Schema(description = "Filter payments created to timestamp")
        Instant toDate,

        @Schema(description = "Page index (0-based)", defaultValue = "0")
        Integer page,

        @Schema(description = "Page size", defaultValue = "10")
        Integer size,

        @Schema(description = "Field to sort by (createdAt, amount, status, paidAt)", defaultValue = "createdAt")
        String sortBy,

        @Schema(description = "Sort direction (ASC, DESC)", defaultValue = "DESC")
        String sortDirection
) {
    public int getPageNumber() {
        return (page == null || page < 0) ? 0 : page;
    }

    public int getPageSize() {
        if (size == null || size < 1) return 10;
        return Math.min(size, 100);
    }

    public String getValidSortBy() {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return switch (sortBy) {
            case "amount", "status", "paidAt", "createdAt" -> sortBy;
            default -> "createdAt";
        };
    }

    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }
}
