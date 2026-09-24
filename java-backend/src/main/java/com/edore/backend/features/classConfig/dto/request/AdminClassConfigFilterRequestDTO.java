package com.edore.backend.features.classConfig.dto.request;

import com.edore.backend.features.classConfig.model.*;
import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record AdminClassConfigFilterRequestDTO(
        @Schema(description = "Search by config name", example = "Cấu hình phòng Lab")
        String search,

        @Schema(description = "Filter by user/creator ID (Admin only)")
        UUID userId,

        @Schema(description = "Filter by lesson duration")
        LessonDuration duration,

        @Schema(description = "Filter by class size range")
        ClassSizeRange classSize,

        @Schema(description = "Filter by classroom space type")
        ClassroomSpace space,

        @Schema(description = "Filter by seating layout")
        SeatingLayout seatingLayout,

        @Schema(description = "Filter by infrastructure item")
        InfrastructureItem infrastructure,

        @Schema(description = "Filter by student device option")
        StudentDeviceOption studentDevices,

        @Schema(description = "Page index (0-based)", defaultValue = "0")
        Integer page,

        @Schema(description = "Page size", defaultValue = "10")
        Integer size,

        @Schema(description = "Field to sort by (createdAt, name)", defaultValue = "createdAt")
        String sortBy,

        @Schema(description = "Sort direction: ASC or DESC", defaultValue = "DESC")
        String sortDirection
) {
    public ClassConfigFilterRequestDTO toUserFilter() {
        return new ClassConfigFilterRequestDTO(search, duration, classSize, space, seatingLayout, infrastructure, studentDevices, page, size, sortBy, sortDirection);
    }
}
