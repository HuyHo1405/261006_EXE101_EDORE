/**
 * AuthService — API Client cho Spring Boot AuthController
 * Spec: AuthController.java (/api/auth/*)
 * Data types imported strictly from @edore/types
 */

import {
  ApiResponse,
  EnumResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
  RegisterRequestDTO,
  ForgotPasswordRequestDTO,
  SendOtpRequestDTO,
  VerifyOtpRequestDTO,
  VerifyOtpResponseDTO,
  ResetPasswordRequestDTO,
  ChangePasswordRequestDTO,
  TokenRefreshRequestDTO,
} from "@edore/types";
import { apiClient } from "@/lib/fetcher";

export const authService = {
  /** 1. Get enums */
  getEnums: (): Promise<ApiResponse<EnumResponseDTO[]>> =>
    apiClient<EnumResponseDTO[]>("/api/auth/enums", { method: "GET" }),

  /** 2. Login */
  login: (data: LoginRequestDTO): Promise<ApiResponse<LoginResponseDTO>> =>
    apiClient<LoginResponseDTO>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 3. Register */
  register: (data: RegisterRequestDTO): Promise<ApiResponse<void>> =>
    apiClient<void>("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 4. Forgot password */
  forgotPassword: (data: ForgotPasswordRequestDTO): Promise<ApiResponse<void>> =>
    apiClient<void>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 5. Send OTP */
  sendOtp: (data: SendOtpRequestDTO): Promise<ApiResponse<void>> =>
    apiClient<void>("/api/auth/send-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 6. Verify OTP */
  verifyOtp: (data: VerifyOtpRequestDTO): Promise<ApiResponse<VerifyOtpResponseDTO>> =>
    apiClient<VerifyOtpResponseDTO>("/api/auth/verify-otp", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 7. Reset password */
  resetPassword: (data: ResetPasswordRequestDTO): Promise<ApiResponse<void>> =>
    apiClient<void>("/api/auth/reset-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 8. Change password */
  changePassword: (data: ChangePasswordRequestDTO): Promise<ApiResponse<void>> =>
    apiClient<void>("/api/auth/change-password", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  /** 9. Refresh token */
  refreshToken: (data?: TokenRefreshRequestDTO): Promise<ApiResponse<LoginResponseDTO>> =>
    apiClient<LoginResponseDTO>("/api/auth/refresh", {
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    }),

  /** 10. Logout */
  logout: (): Promise<ApiResponse<void>> =>
    apiClient<void>("/api/auth/logout", { method: "POST" }),
};
