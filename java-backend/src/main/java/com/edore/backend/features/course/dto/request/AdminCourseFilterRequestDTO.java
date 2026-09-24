package com.edore.backend.features.course.dto.request;

import com.edore.backend.features.course.entity.CourseStatus;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record AdminCourseFilterRequestDTO(
        @Schema(description = "Keyword search in title and description", example = "Toán 12")
        String search,

        @Schema(description = "Filter by user/creator ID (Admin only)")
        UUID userId,

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
        String sortDirection
) {
    public CourseFilterRequestDTO toUserFilter() {
        return new CourseFilterRequestDTO(search, status, categoryId, page, size, sortBy, sortDirection, null);
    }
}
