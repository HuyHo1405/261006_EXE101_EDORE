package com.edore.backend.features.profile.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum ProfileResponseCode implements ResponseCode {

    // --- Success codes ---
    GET_PROFILE_SUCCESS(1200, "Lấy thông tin cá nhân thành công.", HttpStatus.OK, "profile.get_success"),
    UPDATE_PROFILE_SUCCESS(1201, "Cập nhật thông tin cá nhân thành công.", HttpStatus.OK, "profile.update_success"),

    // --- Error codes ---
    PROFILE_USER_NOT_FOUND(2201, "Người dùng không tồn tại.", HttpStatus.BAD_REQUEST, "profile.user_not_found"),
    PROFILE_EMAIL_ALREADY_EXISTS(2202, "Email đã tồn tại.", HttpStatus.CONFLICT, "profile.email_already_exists"),
    PROFILE_PHONE_ALREADY_EXISTS(2203, "Số điện thoại đã tồn tại.", HttpStatus.CONFLICT, "profile.phone_already_exists");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    ProfileResponseCode(int code, String message, HttpStatus status, String key) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.key = key;
    }

    @Override public int getCode() { return code; }
    @Override public String getMessage() { return message; }
    @Override public HttpStatus getStatus() { return status; }
    @Override public String getKey() { return key; }
    @Override public String getDomain() { return "PROFILE"; }
}
