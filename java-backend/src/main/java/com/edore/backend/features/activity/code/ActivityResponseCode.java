package com.edore.backend.features.activity.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum ActivityResponseCode implements ResponseCode {

    // ── Success ──────────────────────────────────────────────────────────────
    GET_SUCCESS(1700, "Lấy hoạt động dạy học thành công.", HttpStatus.OK, "activity.get_success"),
    GET_LIST_SUCCESS(1701, "Lấy danh sách hoạt động dạy học thành công.", HttpStatus.OK, "activity.get_list_success"),
    CREATED(1702, "Tạo hoạt động dạy học thành công.", HttpStatus.CREATED, "activity.created"),
    UPDATED(1703, "Cập nhật hoạt động dạy học thành công.", HttpStatus.OK, "activity.updated"),
    DELETED(1704, "Xoá hoạt động dạy học thành công.", HttpStatus.OK, "activity.deleted"),

    // ── Error ─────────────────────────────────────────────────────────────────
    NOT_FOUND(2700, "Không tìm thấy hoạt động dạy học.", HttpStatus.NOT_FOUND, "activity.not_found"),
    FORBIDDEN(2701, "Bạn không có quyền thao tác hoạt động này.", HttpStatus.FORBIDDEN, "activity.forbidden"),
    INVALID_NODE_TYPE(2702, "Node type không hợp lệ.", HttpStatus.BAD_REQUEST, "activity.invalid_node_type");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    ActivityResponseCode(int code, String message, HttpStatus status, String key) {
        this.code    = code;
        this.message = message;
        this.status  = status;
        this.key     = key;
    }

    @Override public int        getCode()    { return code; }
    @Override public String     getMessage() { return message; }
    @Override public HttpStatus getStatus()  { return status; }
    @Override public String     getKey()     { return key; }
    @Override public String     getDomain()  { return "ACTIVITY"; }
}
