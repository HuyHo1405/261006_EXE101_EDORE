package com.edore.backend.features.classConfig.model;

import lombok.Getter;

@Getter
public enum StudentDeviceOption {
    NONE("Không cho phép / Không có thiết bị"),
    SMARTPHONE("Điện thoại thông minh cá nhân"),
    LAPTOP("Máy tính xách tay cá nhân"),
    TABLET("Máy tính bảng"),
    SCHOOL_COMPUTER("Máy tính phòng lab trường");

    private final String description;

    StudentDeviceOption(String description) {
        this.description = description;
    }
}
