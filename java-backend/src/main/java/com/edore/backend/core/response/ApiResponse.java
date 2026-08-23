package com.edore.backend.core.response;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.Instant;
import java.util.Map;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
@JsonInclude(JsonInclude.Include.NON_NULL)
public class ApiResponse<T> {
    @Builder.Default
    private int code = 500;

    private String message;
    private T result;

    private Map<String, String> errors;
    private String key;
    private Instant timestamp;
    private String path;

    // ─── Success factories ────────────────────────────────────────────────────

    /** No result body */
    public static <T> ApiResponse<T> of(ResponseCode rc) {
        return ApiResponse.<T>builder()
                .code(rc.getCode())
                .key(rc.getKey())
                .message(rc.getMessage())
                .build();
    }

    /** With result body */
    public static <T> ApiResponse<T> of(ResponseCode rc, T result) {
        return ApiResponse.<T>builder()
                .code(rc.getCode())
                .key(rc.getKey())
                .message(rc.getMessage())
                .result(result)
                .build();
    }

    // ─── Error factories ──────────────────────────────────────────────────────

    /** Error with override message, request path, and optional field-level errors */
    public static <T> ApiResponse<T> error(ResponseCode rc, String message, String path,
                                           Map<String, String> errors) {
        return ApiResponse.<T>builder()
                .code(rc.getCode())
                .key(rc.getKey())
                .message(message)
                .errors(errors)
                .path(path)
                .timestamp(Instant.now())
                .build();
    }

    /** Error using the ResponseCode's own message */
    public static <T> ApiResponse<T> error(ResponseCode rc, String path) {
        return error(rc, rc.getMessage(), path, null);
    }
}
