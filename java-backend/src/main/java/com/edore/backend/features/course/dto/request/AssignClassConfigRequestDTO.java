package com.edore.backend.features.course.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

public record AssignClassConfigRequestDTO(

        @NotNull(message = "classConfigId không được để trống.")
        @Schema(example = "1", description = "ID of the ClassConfig to assign to this course")
        Long classConfigId
) {}
