package com.edore.backend.features.subscription.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum SubscriptionPlanCode implements ResponseCode {

    GET_ACTIVE_PLANS_SUCCESS(1400, "Lấy danh sách gói đăng ký thành công.", HttpStatus.OK, "subscription.get_active_plans_success");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    SubscriptionPlanCode(int code, String message, HttpStatus status, String key) {
        this.code = code;
        this.message = message;
        this.status = status;
        this.key = key;
    }

    @Override public int getCode() { return code; }
    @Override public String getMessage() { return message; }
    @Override public HttpStatus getStatus() { return status; }
    @Override public String getKey() { return key; }
    @Override public String getDomain() { return "SUBSCRIPTION"; }
}
