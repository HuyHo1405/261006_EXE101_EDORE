package com.edore.backend.core.exception;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.core.response.ResponseCode;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import com.edore.backend.features.auth.code.AuthResponseCode;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.context.request.WebRequest;
import org.springframework.web.servlet.mvc.method.annotation.ResponseEntityExceptionHandler;

import java.util.LinkedHashMap;
import java.util.Map;

@Slf4j
@RestControllerAdvice
public class GlobalExceptionHandler extends ResponseEntityExceptionHandler {

    @ExceptionHandler(ApiException.class)
    public ResponseEntity<ApiResponse<Object>> handleApiException(ApiException ex, HttpServletRequest request) {
        ResponseCode rc = ex.getResponseCode();
        return ResponseEntity.status(rc.getStatus())
                .body(ApiResponse.error(rc, ex.getMessage(), request.getRequestURI(), null));
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ApiResponse<Object>> handleConstraintViolation(ConstraintViolationException ex,
                                                                         HttpServletRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        ex.getConstraintViolations().forEach(v -> errors.put(v.getPropertyPath().toString(), v.getMessage()));

        ResponseCode rc = CommonResponseCode.VALIDATION_FAILED;
        return ResponseEntity.status(rc.getStatus())
                .body(ApiResponse.error(rc, rc.getMessage(), request.getRequestURI(), errors));
    }

    @Override
    protected ResponseEntity<Object> handleMethodArgumentNotValid(MethodArgumentNotValidException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode statusCode,
                                                                  WebRequest request) {
        Map<String, String> errors = new LinkedHashMap<>();
        for (FieldError fe : ex.getBindingResult().getFieldErrors()) {
            errors.put(fe.getField(), fe.getDefaultMessage());
        }

        ResponseCode rc = CommonResponseCode.VALIDATION_FAILED;
        return new ResponseEntity<>(ApiResponse.error(rc, rc.getMessage(), extractPath(request), errors), rc.getStatus());
    }

    @Override
    protected ResponseEntity<Object> handleHttpMessageNotReadable(HttpMessageNotReadableException ex,
                                                                  HttpHeaders headers,
                                                                  HttpStatusCode statusCode,
                                                                  WebRequest request) {
        log.warn("Invalid HTTP request body or unparseable value: {}", ex.getMessage());
        ResponseCode rc = CommonResponseCode.INVALID_INPUT;
        String message = rc.getMessage();

        if (ex.getCause() instanceof com.fasterxml.jackson.databind.exc.InvalidFormatException ife) {
            if (ife.getTargetType() != null && ife.getTargetType().isEnum()) {
                Object[] enumConstants = ife.getTargetType().getEnumConstants();
                String fieldName = ife.getPath().stream()
                        .map(com.fasterxml.jackson.databind.JsonMappingException.Reference::getFieldName)
                        .reduce((a, b) -> b).orElse("enum");
                message = "Giá trị '" + ife.getValue() + "' không hợp lệ cho trường '" + fieldName + "'. Các giá trị hợp lệ: " + java.util.Arrays.toString(enumConstants);
            }
        }

        return new ResponseEntity<>(ApiResponse.error(rc, message, extractPath(request), null), rc.getStatus());
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> handleAccessDenied(AccessDeniedException ex,
                                                                   HttpServletRequest request) {
        ResponseCode rc = CommonResponseCode.FORBIDDEN;
        return ResponseEntity.status(rc.getStatus())
                .body(ApiResponse.error(rc, request.getRequestURI()));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> handleBadCredentials(BadCredentialsException ex,
                                                                    HttpServletRequest request) {
        ResponseCode rc = AuthResponseCode.INVALID_CREDENTIALS;
        return ResponseEntity.status(rc.getStatus())
                .body(ApiResponse.error(rc, request.getRequestURI()));
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiResponse<Object>> handleAuthentication(AuthenticationException ex,
                                                                    HttpServletRequest request) {
        ResponseCode rc = CommonResponseCode.UNAUTHORIZED;
        return ResponseEntity.status(rc.getStatus())
                .body(ApiResponse.error(rc, request.getRequestURI()));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> handleUnexpected(Exception ex, HttpServletRequest request) {
        log.error("Unexpected error:", ex);
        ResponseCode rc = CommonResponseCode.UNEXPECTED_ERROR;
        return ResponseEntity.status(rc.getStatus())
                .body(ApiResponse.error(rc, request.getRequestURI()));
    }

    private String extractPath(WebRequest request) {
        String desc = request.getDescription(false);
        return desc.startsWith("uri=") ? desc.substring(4) : desc;
    }
}
