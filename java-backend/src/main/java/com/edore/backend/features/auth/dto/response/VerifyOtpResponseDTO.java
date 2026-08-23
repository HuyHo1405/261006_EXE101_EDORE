package com.edore.backend.features.auth.dto.response;

import io.swagger.v3.oas.annotations.media.Schema;

public record VerifyOtpResponseDTO(
        @Schema(description = "Reset token dùng để đặt lại mật khẩu (chỉ trả về khi verify OTP loại RESET_PASSWORD)", example = "b1a2c3d4-5678-90ab-cdef-1234567890ab")
        String resetToken
) {}
