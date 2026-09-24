package com.edore.backend.features.classConfig.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum ClassConfigResponseCode implements ResponseCode {

    // ── Success ──────────────────────────────────────────────────────────────
    GET_SUCCESS(1600, "Lấy cấu hình lớp học thành công.", HttpStatus.OK, "class_config.get_success"),
    GET_LIST_SUCCESS(1601, "Lấy danh sách cấu hình lớp học thành công.", HttpStatus.OK, "class_config.get_list_success"),
    CREATED(1602, "Tạo cấu hình lớp học thành công.", HttpStatus.CREATED, "class_config.created"),
    UPDATED(1603, "Cập nhật cấu hình lớp học thành công.", HttpStatus.OK, "class_config.updated"),
    DELETED(1604, "Xoá cấu hình lớp học thành công.", HttpStatus.OK, "class_config.deleted"),

    // ── Error ─────────────────────────────────────────────────────────────────
    NOT_FOUND(2600, "Không tìm thấy cấu hình lớp học.", HttpStatus.NOT_FOUND, "class_config.not_found"),
    FORBIDDEN(2601, "Bạn không có quyền thao tác cấu hình lớp học này.", HttpStatus.FORBIDDEN, "class_config.forbidden");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    ClassConfigResponseCode(int code, String message, HttpStatus status, String key) {
        this.code    = code;
        this.message = message;
        this.status  = status;
        this.key     = key;
    }

    @Override public int        getCode()    { return code; }
    @Override public String     getMessage() { return message; }
    @Override public HttpStatus getStatus()  { return status; }
    @Override public String     getKey()     { return key; }
    @Override public String     getDomain()  { return "CLASS_CONFIG"; }
}
