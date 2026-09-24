package com.edore.backend.features.category.code;

import com.edore.backend.core.response.ResponseCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum CategoryResponseCode implements ResponseCode {

    GET_LIST_SUCCESS(1000, "Fetch category list successfully", HttpStatus.OK, "category.get_list_success"),
    GET_SUCCESS(1000, "Fetch category successfully", HttpStatus.OK, "category.get_success");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    @Override
    public String getDomain() {
        return "CATEGORY";
    }
}
