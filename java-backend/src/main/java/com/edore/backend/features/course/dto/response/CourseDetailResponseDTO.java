package com.edore.backend.features.course.dto.response;

import com.edore.backend.features.classConfig.dto.response.ClassConfigResponseDTO;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record CourseDetailResponseDTO(
        UUID id,
        UUID userId,
        String title,
        String description,
        String status,
        List<CategorySummary> categories,
        ClassConfigResponseDTO classConfig,
        int scriptCount,
        Instant createdAt,
        Instant updatedAt
) {
    public record CategorySummary(Long id, String name) {}
}

