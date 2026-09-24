package com.edore.backend.features.course.dto.request;

import com.edore.backend.features.course.entity.CourseStatus;
import io.swagger.v3.oas.annotations.media.Schema;

public record CourseFilterRequestDTO(
        @Schema(description = "Keyword search in title and description", example = "Toán 12")
        String search,

        @Schema(description = "Filter by course status (DRAFT, PUBLISHED, ARCHIVED)")
        CourseStatus status,

        @Schema(description = "Filter by category ID")
        Long categoryId,

        @Schema(description = "Page index (0-based)", defaultValue = "0")
        Integer page,

        @Schema(description = "Page size", defaultValue = "10")
        Integer size,

        @Schema(description = "Field to sort by (createdAt, title, status)", defaultValue = "createdAt")
        String sortBy,

        @Schema(description = "Sort direction: ASC or DESC", defaultValue = "DESC")
        String sortDirection,

        @Schema(description = "Include related resources (e.g. 'SCRIPTS')", example = "SCRIPTS")
        CourseIncludeOption include
) {
    public int getPageNumber() {
        return (page == null || page < 0) ? 0 : page;
    }

    public int getPageSize() {
        return (size == null || size <= 0) ? 10 : size;
    }

    public boolean isAscending() {
        return "ASC".equalsIgnoreCase(sortDirection);
    }

    public String getValidSortBy() {
        if (sortBy == null || sortBy.isBlank()) return "createdAt";
        return switch (sortBy) {
            case "title", "status" -> sortBy;
            default -> "createdAt";
        };
    }
}
