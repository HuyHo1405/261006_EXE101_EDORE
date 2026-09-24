package com.edore.backend.features.classConfig.model;

import lombok.Getter;

@Getter
public enum SeatingLayout {
    ROWS("Hàng ngang traditional"),
    U_SHAPE("Hình chữ U"),
    GROUPS("Theo nhóm / Cụm bàn"),
    CIRCLE("Vòng tròn"),
    INDIVIDUAL_DESKS("Bàn cá nhân độc lập");

    private final String description;

    SeatingLayout(String description) {
        this.description = description;
    }
}
