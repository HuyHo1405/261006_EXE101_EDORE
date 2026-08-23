package com.edore.backend.features.auth.service;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.features.auth.dto.request.*;
import com.edore.backend.features.auth.dto.response.*;

import java.util.List;
import java.util.UUID;

public interface AuthenService {

    LoginResponseDTO login(LoginRequestDTO request);

    void logout(String authHeader);

    void register(RegisterRequestDTO request);

    void sendOtp(SendOtpRequestDTO request);

    VerifyOtpResponseDTO verifyOtp(VerifyOtpRequestDTO request);

    ResetPasswordResponseDTO resetPassword(ResetPasswordRequestDTO request);

    ResetPasswordResponseDTO changePassword(UUID userId, ChangePasswordRequestDTO request);

    LoginResponseDTO refreshToken(TokenRefreshRequestDTO request);

    boolean isEmailValid(String email);

    List<EnumResponseDTO> getEnums();
}
