package com.edore.backend.features.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record TokenRefreshRequestDTO(
        @Schema(description = "Refresh token (tùy chọn nếu dùng cookie)", example = "eyJhbGciOiJIUzI1NiJ9...")
        String refreshToken
) {
}
