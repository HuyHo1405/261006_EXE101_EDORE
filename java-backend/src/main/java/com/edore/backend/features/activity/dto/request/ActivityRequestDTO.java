package com.edore.backend.features.activity.dto.request;

import com.edore.backend.features.script.model.NodeTypeEnum;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.List;
import java.util.Set;

public record ActivityRequestDTO(

        @NotBlank(message = "Tên hoạt động không được để trống")
        @Schema(description = "Activity title", example = "Thảo luận nhóm nhỏ")
        String title,

        @Schema(description = "Detailed description / instructions for the activity", example = "Chia lớp thành nhóm 4-5 người, thảo luận trong 10 phút...")
        String content,

        @Schema(description = "Maximum score this activity can yield", example = "10")
        Integer maxScore,

        @Schema(description = "Lesson durations this activity fits (e.g. MIN_45, MIN_90)", example = "[\"MIN_45\", \"MIN_90\"]")
        List<String> allowedDuration,

        @Schema(description = "Class size ranges this activity fits (e.g. SMALL, MEDIUM, LARGE)", example = "[\"MEDIUM\", \"LARGE\"]")
        List<String> allowedClassSize,

        @Schema(description = "Classroom space types this activity fits (e.g. STANDARD, LAB)", example = "[\"STANDARD\"]")
        List<String> allowedSpace,

        @Schema(description = "Seating layouts this activity fits (e.g. ROWS, U_SHAPE)", example = "[\"U_SHAPE\", \"CIRCLE\"]")
        List<String> allowedSeatingLayout,

        @Schema(description = "Infrastructure items required for this activity", example = "[\"PROJECTOR\"]")
        List<String> requiredInfrastructure,

        @Schema(description = "Student devices required for this activity", example = "[\"LAPTOP\"]")
        List<String> requiredDevices,

        @Schema(description = "IDs of NodeTypes this activity is suitable for", example = "[\"KHOI_DONG\", \"HINH_THANH_KIEN_THUC\"]")
        Set<NodeTypeEnum> nodeTypeIds
) {}
