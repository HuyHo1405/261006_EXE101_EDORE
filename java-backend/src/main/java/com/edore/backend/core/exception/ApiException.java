package com.edore.backend.core.exception;

import com.edore.backend.core.response.ResponseCode;
import lombok.Getter;

@Getter
public class ApiException extends RuntimeException {
    private final ResponseCode responseCode;

    public ApiException(ResponseCode responseCode) {
        super(responseCode.getMessage());
        this.responseCode = responseCode;
    }

    public ApiException(ResponseCode responseCode, String message) {
        super(message);
        this.responseCode = responseCode;
    }
}
