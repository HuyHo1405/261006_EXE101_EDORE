package com.edore.backend.features.classConfig.model;

import lombok.Getter;

@Getter
public enum InfrastructureItem {
    PROJECTOR("Máy chiếu / Màn hình TV"),
    WHITEBOARD("Bảng trắng / Bảng đen"),
    AIR_CONDITIONER("Điều hoà"),
    SPEAKER_SYSTEM("Hệ thống loa âm thanh"),
    SMART_BOARD("Bảng tương tác thông minh"),
    STATIONERY("Dụng cụ học tập (Giấy A0, Bút dạ)");

    private final String description;

    InfrastructureItem(String description) {
        this.description = description;
    }
}
