package com.edore.backend.features.category.service;

import com.edore.backend.features.category.dto.response.CategoryResponseDTO;
import com.edore.backend.features.category.entity.CategoryType;

import java.util.List;

public interface CategoryService {
    List<CategoryResponseDTO> getCategories(CategoryType type);
    CategoryResponseDTO getCategoryById(Long id);
}
