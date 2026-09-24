package com.edore.backend.features.category.dto.response;

import com.edore.backend.features.category.entity.CategoryType;
import com.fasterxml.jackson.annotation.JsonInclude;

@JsonInclude(JsonInclude.Include.NON_NULL)
public record CategoryResponseDTO(
        Long id,
        CategoryType type,
        String code,
        String name,
        String description
) {}
