package com.edore.backend.features.auth.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum AuthResponseCode implements ResponseCode {

    // --- Success codes ---
    LOGIN_SUCCESS(1100, "Đăng nhập thành công.", HttpStatus.OK, "auth.login_success"),
    LOGOUT_SUCCESS(1101, "Đăng xuất thành công.", HttpStatus.OK, "auth.logout_success"),
    REGISTER_SUCCESS(1102, "Đăng ký thành công. Vui lòng kiểm tra email để kích hoạt tài khoản.", HttpStatus.OK, "auth.register_success"),
    FORGOT_PASSWORD_SUCCESS(1103, "Yêu cầu quên mật khẩu thành công.", HttpStatus.OK, "auth.forgot_password_success"),
    RESET_PASSWORD_SUCCESS(1104, "Đặt lại mật khẩu thành công.", HttpStatus.OK, "auth.reset_password_success"),
    VERIFY_OTP_SUCCESS(1105, "Xác thực mã OTP thành công.", HttpStatus.OK, "auth.verify_otp_success"),
    REFRESH_TOKEN_SUCCESS(1106, "Lấy token mới thành công.", HttpStatus.OK, "auth.refresh_token_success"),
    GET_ENUMS_SUCCESS(1107, "Lấy danh sách enums thành công.", HttpStatus.OK, "auth.get_enums_success"),

    // --- Error codes ---
    REFRESH_TOKEN_INVALID(2101, "Refresh token không hợp lệ hoặc đã hết hạn.", HttpStatus.UNAUTHORIZED, "auth.refresh_token_invalid"),
    REFRESH_TOKEN_NOT_FOUND(2102, "Refresh token không tồn tại hoặc đã hết hạn.", HttpStatus.UNAUTHORIZED, "auth.refresh_token_not_found"),
    USER_NOT_ACTIVE(2103, "Tài khoản chưa được kích hoạt.", HttpStatus.FORBIDDEN, "auth.user_not_active"),
    PASSWORD_MISMATCH(2104, "Mật khẩu và xác nhận mật khẩu không khớp.", HttpStatus.BAD_REQUEST, "auth.password_mismatch"),
    EMAIL_ALREADY_EXISTS(2105, "Email đã tồn tại.", HttpStatus.CONFLICT, "auth.email_already_exists"),
    PHONE_ALREADY_EXISTS(2106, "Số điện thoại đã tồn tại.", HttpStatus.CONFLICT, "auth.phone_already_exists"),
    OTP_INVALID(2107, "Mã OTP không hợp lệ.", HttpStatus.BAD_REQUEST, "auth.otp_invalid"),
    OTP_EXPIRED(2108, "Mã OTP đã hết hạn.", HttpStatus.BAD_REQUEST, "auth.otp_expired"),
    OLD_PASSWORD_INCORRECT(2109, "Mật khẩu cũ không khớp.", HttpStatus.BAD_REQUEST, "auth.old_password_incorrect"),
    USER_NOT_FOUND(2110, "Không tìm thấy người dùng.", HttpStatus.NOT_FOUND, "auth.user_not_found"),
    INVALID_CREDENTIALS(2111, "Email hoặc mật khẩu không chính xác.", HttpStatus.UNAUTHORIZED, "auth.invalid_credentials"),
    NEW_PASSWORD_SAME_AS_OLD(2112, "Mật khẩu mới không được trùng với mật khẩu cũ.", HttpStatus.BAD_REQUEST, "auth.new_password_same_as_old"),
    INVALID_RESET_TOKEN(2113, "Reset token không hợp lệ hoặc đã hết hạn. Vui lòng xác thực mã OTP trước.", HttpStatus.BAD_REQUEST, "auth.invalid_reset_token");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    AuthResponseCode(int code, String message, HttpStatus status, String key) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.key = key;
    }

    @Override public int getCode() { return code; }
    @Override public String getMessage() { return message; }
    @Override public HttpStatus getStatus() { return status; }
    @Override public String getKey() { return key; }
    @Override public String getDomain() { return "AUTH"; }
}
