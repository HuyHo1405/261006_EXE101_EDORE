package com.edore.backend.features.auth.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record LoginRequestDTO(
        @NotBlank(message = "Email không được để trống.")
        @Email(message = "Email không đúng định dạng.")
        @Size(min = 10, max = 50, message = "Email phải có độ dài từ 10 đến 50 ký tự.")
        @Schema(example = "user@sba.com")
        String email,

        @NotBlank(message = "Mật khẩu không được để trống.")
        @Size(min = 8, max = 50, message = "Mật khẩu phải từ 8 đến 50 ký tự.")
        @Schema(example = "P@ssw0rd123")
        String password
) {}
