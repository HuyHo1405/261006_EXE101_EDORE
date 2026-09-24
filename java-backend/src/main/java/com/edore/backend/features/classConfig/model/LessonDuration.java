package com.edore.backend.features.classConfig.model;

import lombok.Getter;

@Getter
public enum LessonDuration {
    MIN_45(45, "45 phút (1 tiết)"),
    MIN_90(90, "90 phút (2 tiết)"),
    MIN_135(135, "135 phút (3 tiết)"),
    MIN_180(180, "180 phút (4 tiết)");

    private final int minutes;
    private final String description;

    LessonDuration(int minutes, String description) {
        this.minutes = minutes;
        this.description = description;
    }
}
