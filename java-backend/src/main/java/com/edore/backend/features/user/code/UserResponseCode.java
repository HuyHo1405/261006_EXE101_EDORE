package com.edore.backend.features.user.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum UserResponseCode implements ResponseCode {

    // --- Success codes ---
    GET_PROFILE_SUCCESS(1200, "Lấy thông tin cá nhân thành công.", HttpStatus.OK, "user.get_profile_success"),
    UPDATE_PROFILE_SUCCESS(1201, "Cập nhật thông tin cá nhân thành công.", HttpStatus.OK, "user.update_profile_success"),

    // --- Error codes ---
    USER_NOT_FOUND(2201, "Người dùng không tồn tại.", HttpStatus.BAD_REQUEST, "user.not_found"),
    EMAIL_ALREADY_EXISTS(2202, "Email đã tồn tại.", HttpStatus.CONFLICT, "user.email_already_exists"),
    PHONE_ALREADY_EXISTS(2203, "Số điện thoại đã tồn tại.", HttpStatus.CONFLICT, "user.phone_already_exists");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    UserResponseCode(int code, String message, HttpStatus status, String key) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.key = key;
    }

    @Override public int getCode() { return code; }
    @Override public String getMessage() { return message; }
    @Override public HttpStatus getStatus() { return status; }
    @Override public String getKey() { return key; }
    @Override public String getDomain() { return "USER"; }
}
