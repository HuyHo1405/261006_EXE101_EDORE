package com.edore.backend.features.classConfig.model;

import lombok.Getter;

@Getter
public enum ClassSizeRange {
    SMALL("Dưới 15 học sinh (Lớp nhỏ)"),
    MEDIUM("15 - 35 học sinh (Lớp tiêu chuẩn)"),
    LARGE("36 - 60 học sinh (Lớp đông)"),
    VERY_LARGE("Trên 60 học sinh (Hội trường / Giảng đường)");

    private final String description;

    ClassSizeRange(String description) {
        this.description = description;
    }
}
