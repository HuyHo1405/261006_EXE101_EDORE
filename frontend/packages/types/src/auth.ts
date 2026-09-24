/**
 * Auth DTOs & ApiResponse Types — @edore/types
 * Matching Spring Boot AuthController DTOs & ApiResponse<T>
 */

export interface ApiResponse<T = void> {
  code: number;
  message: string;
  result?: T;
  errors?: Record<string, string>;
  key?: string;
  timestamp?: string;
  path?: string;
}

export type OtpType = "REGISTER" | "RESET_PASSWORD";

/**
 * AuthResponseCode matching java-backend com.edore.backend.features.auth.code.AuthResponseCode
 */
export const AuthResponseCode = {
  // --- Success codes (11xx) ---
  LOGIN_SUCCESS: 1100,
  LOGOUT_SUCCESS: 1101,
  REGISTER_SUCCESS: 1102,
  FORGOT_PASSWORD_SUCCESS: 1103,
  RESET_PASSWORD_SUCCESS: 1104,
  VERIFY_OTP_SUCCESS: 1105,
  REFRESH_TOKEN_SUCCESS: 1106,
  GET_ENUMS_SUCCESS: 1107,

  // --- Error codes (21xx) ---
  REFRESH_TOKEN_INVALID: 2101,
  REFRESH_TOKEN_NOT_FOUND: 2102,
  USER_NOT_ACTIVE: 2103,
  PASSWORD_MISMATCH: 2104,
  EMAIL_ALREADY_EXISTS: 2105,
  PHONE_ALREADY_EXISTS: 2106,
  OTP_INVALID: 2107,
  OTP_EXPIRED: 2108,
  OLD_PASSWORD_INCORRECT: 2109,
  USER_NOT_FOUND: 2110,
  INVALID_CREDENTIALS: 2111,
  NEW_PASSWORD_SAME_AS_OLD: 2112,
  INVALID_RESET_TOKEN: 2113,
} as const;

export type AuthResponseCode = (typeof AuthResponseCode)[keyof typeof AuthResponseCode];

export const AUTH_ERROR_MESSAGES: Record<number, string> = {
  [AuthResponseCode.REFRESH_TOKEN_INVALID]: "Refresh token không hợp lệ hoặc đã hết hạn.",
  [AuthResponseCode.REFRESH_TOKEN_NOT_FOUND]: "Refresh token không tồn tại hoặc đã hết hạn.",
  [AuthResponseCode.USER_NOT_ACTIVE]: "Tài khoản chưa được kích hoạt.",
  [AuthResponseCode.PASSWORD_MISMATCH]: "Mật khẩu và xác nhận mật khẩu không khớp.",
  [AuthResponseCode.EMAIL_ALREADY_EXISTS]: "Email đã tồn tại trong hệ thống.",
  [AuthResponseCode.PHONE_ALREADY_EXISTS]: "Số điện thoại đã tồn tại.",
  [AuthResponseCode.OTP_INVALID]: "Mã OTP không hợp lệ.",
  [AuthResponseCode.OTP_EXPIRED]: "Mã OTP đã hết hạn.",
  [AuthResponseCode.OLD_PASSWORD_INCORRECT]: "Mật khẩu cũ không đúng.",
  [AuthResponseCode.USER_NOT_FOUND]: "Không tìm thấy thông tin tài khoản.",
  [AuthResponseCode.INVALID_CREDENTIALS]: "Email hoặc mật khẩu không chính xác.",
  [AuthResponseCode.NEW_PASSWORD_SAME_AS_OLD]: "Mật khẩu mới không được trùng với mật khẩu cũ.",
  [AuthResponseCode.INVALID_RESET_TOKEN]: "Reset token không hợp lệ hoặc đã hết hạn.",
};

export interface EnumResponseDTO {
  name: string;
  value: string;
  description?: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  refreshToken: string;
  userId: string;
  username: string;
  email: string;
  roles: string[];
}

export interface RegisterRequestDTO {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface ForgotPasswordRequestDTO {
  email: string;
}

export interface SendOtpRequestDTO {
  email: string;
  type: OtpType;
}

export interface VerifyOtpRequestDTO {
  email: string;
  otpCode: string;
  type: OtpType;
}

export interface VerifyOtpResponseDTO {
  resetToken?: string;
}

export interface ResetPasswordRequestDTO {
  email: string;
  resetToken: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ChangePasswordRequestDTO {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface TokenRefreshRequestDTO {
  refreshToken: string;
}
