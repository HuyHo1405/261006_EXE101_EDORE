package com.edore.backend.features.auth.dto.request;

import com.edore.backend.features.auth.model.OtpType;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SendOtpRequestDTO(
        @NotBlank(message = "Email không được để trống.")
        @Email(message = "Email không đúng định dạng.")
        @Schema(example = "user@example.com")
        String email,

        @NotNull(message = "Loại OTP không được để trống (REGISTER / RESET_PASSWORD).")
        @Schema(implementation = OtpType.class, allowableValues = {"REGISTER", "RESET_PASSWORD"}, description = "Loại OTP (REGISTER hoặc RESET_PASSWORD)", example = "REGISTER")
        OtpType type
) {}
