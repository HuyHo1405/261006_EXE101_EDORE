package com.edore.backend.features.activity.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record ActivityFilterRequestDTO(

        @Schema(description = "Filter by NodeType ID", example = "1")
        Long nodeTypeId,

        @Schema(description = "Filter activities that support this classroom space (e.g. STANDARD, COMPUTER_LAB, ONLINE)", example = "STANDARD")
        String allowedSpace,

        @Schema(description = "Filter activities that support this lesson duration (e.g. MIN_45, MIN_90)", example = "MIN_45")
        String allowedDuration,

        @Schema(description = "Filter activities that support this class size (e.g. SMALL, MEDIUM, LARGE)", example = "MEDIUM")
        String allowedClassSize,

        @Schema(description = "Page index (0-based)", defaultValue = "0")
        Integer page,

        @Schema(description = "Page size", defaultValue = "20")
        Integer size,

        @Schema(description = "Field to sort by (createdAt, title, maxScore)", defaultValue = "createdAt")
        String sortBy,

        @Schema(description = "Sort direction: ASC or DESC", defaultValue = "DESC")
        String sortDirection
) {
    public int getPageNumber() {
        return (page == null || page < 0) ? 0 : page;
    }

    public int getPageSize() {
        return (size == null || size <= 0) ? 20 : size;
    }

    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }

    public String getValidSortBy() {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return switch (sortBy) {
            case "title", "maxScore", "createdAt" -> sortBy;
            default -> "createdAt";
        };
    }
}
