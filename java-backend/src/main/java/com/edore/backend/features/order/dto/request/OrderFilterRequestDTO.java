package com.edore.backend.features.order.dto.request;

import com.edore.backend.features.order.model.OrderStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.UUID;

public record OrderFilterRequestDTO(
        @Schema(description = "Order status filter (PENDING, PAID, CANCELLED, FAILED, EXPIRED)", example = "PENDING")
        OrderStatus status,

        @Schema(description = "Subscription plan ID filter", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID subscriptionPlanId,

        @Schema(description = "Keyword search (gatewayOrderCode, user email or username)", example = "ORD-12345")
        String search,

        @Schema(description = "Filter orders created from timestamp")
        Instant fromDate,

        @Schema(description = "Filter orders created to timestamp")
        Instant toDate,

        @Schema(description = "Filter by user ID (Admin only)", example = "550e8400-e29b-41d4-a716-446655440000")
        UUID userId,

        @Schema(description = "Page index (0-based)", defaultValue = "0")
        Integer page,

        @Schema(description = "Page size", defaultValue = "10")
        Integer size,

        @Schema(description = "Field to sort by (createdAt, amount, status)", defaultValue = "createdAt")
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
            case "amount", "status", "createdAt", "updatedAt" -> sortBy;
            default -> "createdAt";
        };
    }

    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }
}
