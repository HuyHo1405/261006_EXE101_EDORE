package com.edore.backend.features.profile.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

public record ProfileResponse(
        @Schema(example = "550e8400-e29b-41d4-a716-446655440000")
        UUID id,

        @Schema(example = "Nguyen Van A")
        String fullName,

        @Schema(example = "user@example.com")
        String email,

        @Schema(example = "0912345678")
        String phone
) {}
