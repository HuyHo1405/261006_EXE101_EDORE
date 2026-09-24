package com.edore.backend.features.course.dto.request;

import com.edore.backend.features.classConfig.dto.request.ClassConfigRequestDTO;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.Set;

public record CourseRequestDTO(

        @NotBlank(message = "Tiêu đề khoá học không được để trống.")
        @Size(max = 255, message = "Tiêu đề không được vượt quá 255 ký tự.")
        @Schema(example = "Lớp học Toán lớp 10")
        String title,

        @Schema(example = "Khoá học Toán dành cho học sinh lớp 10 chương trình chuẩn.")
        String description,

        @Schema(example = "DRAFT", allowableValues = {"DRAFT", "PUBLISHED", "ARCHIVED"})
        String status,

        @Schema(example = "[1, 2]", description = "Set of category IDs to assign to this course")
        Set<Long> categoryIds,

        @Schema(example = "1", description = "Optional ID of an existing ClassConfig to assign")
        Long classConfigId,

        @Schema(description = "Optional custom/default ClassConfig object to create along with this course")
        ClassConfigRequestDTO classConfigRequest
) {}

