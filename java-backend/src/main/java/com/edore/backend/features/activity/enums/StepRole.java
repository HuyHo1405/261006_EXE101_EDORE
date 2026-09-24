package com.edore.backend.features.activity.enums;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum StepRole {
    LOGISTICS("Hành chính / Tổ chức"),
    PAYLOAD_MAIN("Giảng dạy / Nội dung chính"),
    PAYLOAD_SECONDARY("Nội dung phụ / Mở rộng"),
    CHECKPOINT("Kiểm tra / Đánh giá"),
    WRAP_UP("Tổng kết / Thu hoạch");

    private final String description;
}
