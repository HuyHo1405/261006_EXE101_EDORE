package com.edore.backend.features.auth.controller;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.auth.code.AuthResponseCode;
import com.edore.backend.features.auth.dto.request.*;
import com.edore.backend.features.auth.dto.response.*;
import com.edore.backend.features.auth.service.AuthenService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/auth")
@Tag(name = "Auth APIs", description = "Authentication APIs (login, register, password management, OTP)")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenService authenService;

    @Operation(summary = "Login", description = "Authenticate user and return JWT access token")
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> login(
            @Valid @RequestBody LoginRequestDTO loginRequestDTO) {
        LoginResponseDTO loginResponse = authenService.login(loginRequestDTO);

        ResponseCookie cookie = ResponseCookie.from("refreshToken", loginResponse.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.of(AuthResponseCode.LOGIN_SUCCESS, loginResponse));
    }

    @Operation(
            summary = "Logout",
            description = "Blacklist current JWT access token",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/logout")
    public ResponseEntity<ApiResponse<Void>> logout(HttpServletRequest request) {
        authenService.logout(request.getHeader("Authorization"));
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.LOGOUT_SUCCESS));
    }

    @Operation(summary = "Register", description = "Register new user account (inactive by default)")
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<Void>> register(
            @Valid @RequestBody RegisterRequestDTO registerRequestDTO) {
        authenService.register(registerRequestDTO);
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.REGISTER_SUCCESS));
    }

    @Operation(summary = "Send OTP", description = "Send 6-digit OTP code to user's email for REGISTER or RESET_PASSWORD")
    @PostMapping("/send-otp")
    public ResponseEntity<ApiResponse<Void>> sendOtp(
            @Valid @RequestBody SendOtpRequestDTO requestDTO) {
        authenService.sendOtp(requestDTO);
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.VERIFY_OTP_SUCCESS));
    }

    @Operation(summary = "Verify OTP", description = "Verify 6-digit OTP code. If type is RESET_PASSWORD, returns resetToken for password reset.")
    @PostMapping("/verify-otp")
    public ResponseEntity<ApiResponse<VerifyOtpResponseDTO>> verifyOtp(
            @Valid @RequestBody VerifyOtpRequestDTO requestDTO) {
        VerifyOtpResponseDTO result = authenService.verifyOtp(requestDTO);
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.VERIFY_OTP_SUCCESS, result));
    }

    @Operation(summary = "Forgot password request", description = "Trigger reset password OTP sent to email")
    @PostMapping("/forgot-password")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(
            @Valid @RequestBody ForgotPasswordRequestDTO requestDTO) {
        authenService.sendOtp(new SendOtpRequestDTO(requestDTO.email(), com.edore.backend.features.auth.model.OtpType.RESET_PASSWORD));
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.FORGOT_PASSWORD_SUCCESS));
    }

    @Operation(summary = "Reset password", description = "Reset password after OTP verification")
    @PostMapping("/reset-password")
    public ResponseEntity<ApiResponse<ResetPasswordResponseDTO>> resetPassword(
            @Valid @RequestBody ResetPasswordRequestDTO requestDTO) {
        ResetPasswordResponseDTO result = authenService.resetPassword(requestDTO);
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.RESET_PASSWORD_SUCCESS, result));
    }

    @Operation(
            summary = "Change password",
            description = "Change password for logged-in user using old password",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PostMapping("/change-password")
    public ResponseEntity<ApiResponse<ResetPasswordResponseDTO>> changePassword(
            @CurrentUser UUID userId,
            @Valid @RequestBody ChangePasswordRequestDTO requestDTO) {
        ResetPasswordResponseDTO result = authenService.changePassword(userId, requestDTO);
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.RESET_PASSWORD_SUCCESS, result));
    }

    @Operation(summary = "Refresh token", description = "Generate new access token using existing refresh token")
    @PostMapping("/refresh")
    public ResponseEntity<ApiResponse<LoginResponseDTO>> refresh(
            @RequestBody(required = false) TokenRefreshRequestDTO requestDTO,
            @CookieValue(name = "refreshToken", required = false) String cookieRefreshToken) {

        String tokenToUse = null;
        if (requestDTO != null && requestDTO.refreshToken() != null && !requestDTO.refreshToken().isBlank()) {
            tokenToUse = requestDTO.refreshToken();
        } else if (cookieRefreshToken != null && !cookieRefreshToken.isBlank()) {
            tokenToUse = cookieRefreshToken;
        }

        if (tokenToUse == null) {
            throw new ApiException(CommonResponseCode.UNAUTHORIZED);
        }

        LoginResponseDTO refreshResponse = authenService.refreshToken(new TokenRefreshRequestDTO(tokenToUse));

        ResponseCookie cookie = ResponseCookie.from("refreshToken", refreshResponse.refreshToken())
                .httpOnly(true)
                .secure(true)
                .sameSite("Strict")
                .path("/api/auth/refresh")
                .maxAge(7 * 24 * 60 * 60)
                .build();

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(ApiResponse.of(AuthResponseCode.REFRESH_TOKEN_SUCCESS, refreshResponse));
    }

    @Operation(summary = "Get enums")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.of(AuthResponseCode.GET_ENUMS_SUCCESS, authenService.getEnums()));
    }
}
