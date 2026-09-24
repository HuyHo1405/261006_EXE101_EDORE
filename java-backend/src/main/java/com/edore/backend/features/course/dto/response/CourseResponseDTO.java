package com.edore.backend.features.course.dto.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import java.time.Instant;
import java.util.List;
import java.util.UUID;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CourseResponseDTO(
        UUID id,
        UUID userId,
        String title,
        String description,
        String status,
        List<CategorySummary> categories,
        int scriptCount,
        List<ScriptSummary> scripts,
        Instant createdAt,
        Instant updatedAt
) {
    public record CategorySummary(Long id, String name) {}
    public record ScriptSummary(UUID id, String title) {}
}

