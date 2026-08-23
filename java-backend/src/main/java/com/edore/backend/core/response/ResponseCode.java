package com.edore.backend.core.response;

import org.springframework.http.HttpStatus;

public interface ResponseCode {

    int getCode();

    String getMessage();

    HttpStatus getStatus();

    String getKey();

    default String getDomain() {
        return "COMMON";
    }

    default boolean isClientError() {
        return getStatus().is4xxClientError();
    }

    default boolean isServerError() {
        return getStatus().is5xxServerError();
    }

    default boolean isSuccess() {
        return getStatus().is2xxSuccessful();
    }
}
