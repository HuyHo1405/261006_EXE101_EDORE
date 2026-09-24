package com.edore.backend.features.ai.code;

import com.edore.backend.core.response.ResponseCode;
import org.springframework.http.HttpStatus;

public enum AiResponseCode implements ResponseCode {

    // ── Success ─────────────────────────────────────────────────────────────
    SCRIPT_GENERATED(1200, "Tạo kịch bản bài học thành công.", HttpStatus.OK, "ai.script_generated"),

    // ── Client errors ────────────────────────────────────────────────────────
    NO_FILE_PROVIDED(2200, "Chưa có file được tải lên.", HttpStatus.BAD_REQUEST, "ai.no_file"),
    FILE_TOO_LARGE(2201, "File vượt quá giới hạn cho phép.", HttpStatus.BAD_REQUEST, "ai.file_too_large"),
    UNSUPPORTED_FILE_TYPE(2202, "Định dạng file không được hỗ trợ. Chỉ chấp nhận PDF, DOCX, TXT, MD.", HttpStatus.BAD_REQUEST, "ai.unsupported_file_type"),
    TEMPLATE_NOT_FOUND(2203, "Không tìm thấy template bài học.", HttpStatus.NOT_FOUND, "ai.template_not_found"),
    CLASS_CONFIG_NOT_FOUND(2204, "Không tìm thấy cấu hình lớp học.", HttpStatus.NOT_FOUND, "ai.class_config_not_found"),
    COURSE_NOT_FOUND(2205, "Không tìm thấy khoá học.", HttpStatus.NOT_FOUND, "ai.course_not_found"),
    EMPTY_EXTRACTED_TEXT(2206, "Không trích xuất được nội dung từ file.", HttpStatus.BAD_REQUEST, "ai.empty_extracted_text"),

    // ── Server / external errors ──────────────────────────────────────────────
    FILE_EXTRACT_ERROR(3200, "Lỗi khi trích xuất nội dung file.", HttpStatus.INTERNAL_SERVER_ERROR, "ai.file_extract_error"),
    LLM_API_ERROR(3201, "Lỗi khi gọi AI API.", HttpStatus.BAD_GATEWAY, "ai.llm_error"),
    JSON_PARSE_ERROR(3202, "AI trả về dữ liệu không hợp lệ, không thể phân tích JSON.", HttpStatus.INTERNAL_SERVER_ERROR, "ai.json_parse_error"),
    SCRIPT_SAVE_ERROR(3203, "Lỗi khi lưu kịch bản vào database.", HttpStatus.INTERNAL_SERVER_ERROR, "ai.script_save_error"),
    NODE_COUNT_MISMATCH(3204, "AI trả về số lượng node không khớp với template.", HttpStatus.INTERNAL_SERVER_ERROR, "ai.node_count_mismatch");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    AiResponseCode(int code, String message, HttpStatus status, String key) {
        this.code    = code;
        this.message = message;
        this.status  = status;
        this.key     = key;
    }

    @Override public int        getCode()    { return code; }
    @Override public String     getMessage() { return message; }
    @Override public HttpStatus getStatus()  { return status; }
    @Override public String     getKey()     { return key; }
    @Override public String     getDomain()  { return "AI"; }
}
