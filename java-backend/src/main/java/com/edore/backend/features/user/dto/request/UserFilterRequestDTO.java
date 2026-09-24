package com.edore.backend.features.user.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record UserFilterRequestDTO(
        @Schema(description = "Filter by account active status (true/false)", example = "true")
        Boolean isActive,

        @Schema(description = "Keyword search (username, email, phone)", example = "user")
        String search,

        @Schema(description = "Page index (0-based)", defaultValue = "0")
        Integer page,

        @Schema(description = "Page size", defaultValue = "10")
        Integer size,

        @Schema(description = "Field to sort by (createdAt, username, email, phone)", defaultValue = "createdAt")
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
            case "username", "email", "phone", "createdAt", "updatedAt" -> sortBy;
            default -> "createdAt";
        };
    }

    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }
}
