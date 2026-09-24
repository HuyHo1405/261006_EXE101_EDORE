package com.edore.backend.features.course.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum CourseResponseCode implements ResponseCode {

    // ── Success ──────────────────────────────────────────────────────────────
    GET_SUCCESS(1500, "Lấy khoá học thành công.", HttpStatus.OK, "course.get_success"),
    GET_LIST_SUCCESS(1501, "Lấy danh sách khoá học thành công.", HttpStatus.OK, "course.get_list_success"),
    CREATED(1502, "Tạo khoá học thành công.", HttpStatus.CREATED, "course.created"),
    UPDATED(1503, "Cập nhật khoá học thành công.", HttpStatus.OK, "course.updated"),
    DELETED(1504, "Xoá khoá học thành công.", HttpStatus.OK, "course.deleted"),
    CLASS_CONFIG_ASSIGNED(1505, "Gán cấu hình lớp học cho khoá học thành công.", HttpStatus.OK, "course.class_config_assigned"),

    // ── Error ─────────────────────────────────────────────────────────────────
    NOT_FOUND(2500, "Không tìm thấy khoá học.", HttpStatus.NOT_FOUND, "course.not_found"),
    FORBIDDEN(2501, "Bạn không có quyền thao tác khoá học này.", HttpStatus.FORBIDDEN, "course.forbidden"),
    INVALID_STATUS(2502, "Trạng thái khoá học không hợp lệ.", HttpStatus.BAD_REQUEST, "course.invalid_status");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    CourseResponseCode(int code, String message, HttpStatus status, String key) {
        this.code    = code;
        this.message = message;
        this.status  = status;
        this.key     = key;
    }

    @Override public int        getCode()    { return code; }
    @Override public String     getMessage() { return message; }
    @Override public HttpStatus getStatus()  { return status; }
    @Override public String     getKey()     { return key; }
    @Override public String     getDomain()  { return "COURSE"; }
}
