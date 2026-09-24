package com.edore.backend.features.classConfig.dto.request;

import com.edore.backend.features.classConfig.model.*;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record ClassConfigRequestDTO(
        @NotBlank(message = "Tên cấu hình lớp học không được để trống")
        @Schema(description = "Name/Label of this classroom configuration", example = "Cấu hình phòng máy tính")
        String name,

        @Schema(description = "Lesson duration (MIN_45, MIN_90, MIN_135, MIN_180)", example = "MIN_45")
        LessonDuration duration,

        @Schema(description = "Class size range (SMALL, MEDIUM, LARGE, VERY_LARGE)", example = "MEDIUM")
        ClassSizeRange classSize,

        @Schema(description = "Classroom space type", example = "LAB")
        ClassroomSpace space,

        @Schema(description = "Seating layout", example = "U_SHAPE")
        SeatingLayout seatingLayout,

        @Schema(description = "Available infrastructure items", example = "[\"WHITEBOARD\", \"PROJECTOR\"]")
        List<InfrastructureItem> infrastructure,

        @Schema(description = "Available student devices", example = "[\"LAPTOP\"]")
        List<StudentDeviceOption> studentDevices
) {}
