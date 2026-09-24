package com.edore.backend.features.classConfig.model;

import lombok.Getter;

@Getter
public enum ClassroomSpace {
    STANDARD("Phòng học tiêu chuẩn"),
    COMPUTER_LAB("Phòng máy tính"),
    AUDITORIUM("Hội trường"),
    OUTDOOR("Sân trường / Ngoài trời"),
    ONLINE("Phòng học trực tuyến");

    private final String description;

    ClassroomSpace(String description) {
        this.description = description;
    }
}
