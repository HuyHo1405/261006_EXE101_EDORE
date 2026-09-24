package com.edore.backend.features.script.dto.response;

import java.time.Instant;
import java.util.UUID;

public record ScriptResponseDTO(
        UUID id,
        UUID courseId,
        String courseTitle,
        String title,
        String status,
        Instant createdAt,
        Instant updatedAt
) {}
