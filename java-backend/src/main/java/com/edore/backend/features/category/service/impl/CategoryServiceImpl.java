package com.edore.backend.features.category.service.impl;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.category.dto.response.CategoryResponseDTO;
import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.category.repository.CategoryRepository;
import com.edore.backend.features.category.service.CategoryService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class CategoryServiceImpl implements CategoryService {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CategoryResponseDTO> getCategories(CategoryType type) {
        List<Category> categories = (type != null)
                ? categoryRepository.findByType(type)
                : categoryRepository.findAll();

        return categories.stream()
                .map(this::toResponseDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CategoryResponseDTO getCategoryById(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ApiException(CommonResponseCode.RESOURCE_NOT_FOUND, "Category not found with id: " + id));
        return toResponseDTO(category);
    }

    private CategoryResponseDTO toResponseDTO(Category category) {
        return new CategoryResponseDTO(
                category.getId(),
                category.getType(),
                category.getCode(),
                category.getName(),
                category.getDescription()
        );
    }
}
