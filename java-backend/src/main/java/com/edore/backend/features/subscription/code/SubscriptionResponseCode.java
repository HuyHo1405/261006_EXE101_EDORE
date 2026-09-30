package com.edore.backend.features.subscription.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum SubscriptionResponseCode implements ResponseCode {

    // ── Success ──────────────────────────────────────────────────────────────
    GET_MY_SUBSCRIPTION_SUCCESS(1404, "Lấy thông tin đăng ký thành công.", HttpStatus.OK, "subscription.get_my_success"),

    // ── Client errors ────────────────────────────────────────────────────────
    NO_ACTIVE_SUBSCRIPTION(1401, "Bạn chưa có gói đăng ký nào đang hoạt động.", HttpStatus.FORBIDDEN, "subscription.no_active"),
    COURSE_LIMIT_EXCEEDED(1402, "Đã đạt giới hạn số khóa học của gói hiện tại.", HttpStatus.FORBIDDEN, "subscription.course_limit"),
    SCRIPT_LIMIT_EXCEEDED(1403, "Khóa học đã đạt giới hạn số kịch bản của gói hiện tại.", HttpStatus.FORBIDDEN, "subscription.script_limit");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    SubscriptionResponseCode(int code, String message, HttpStatus status, String key) {
        this.code    = code;
        this.message = message;
        this.status  = status;
        this.key     = key;
    }

    @Override public int        getCode()    { return code; }
    @Override public String     getMessage() { return message; }
    @Override public HttpStatus getStatus()  { return status; }
    @Override public String     getKey()     { return key; }
    @Override public String     getDomain()  { return "SUBSCRIPTION"; }
}
