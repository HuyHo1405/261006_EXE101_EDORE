package com.edore.backend.features.category.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.category.code.CategoryResponseCode;
import com.edore.backend.features.category.dto.response.CategoryResponseDTO;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.category.service.CategoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Slf4j
@RestController
@RequestMapping("/api/categories")
@Tag(name = "15. Category APIs", description = "Taxonomy category management")
@RequiredArgsConstructor
public class CategoryController {

    private final CategoryService categoryService;

    @Operation(summary = "1. Get all categories (optional filter by type: SUBJECT, GRADE, PURPOSE, OTHER)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<CategoryResponseDTO>>> getCategories(
            @RequestParam(required = false) CategoryType type) {
        List<CategoryResponseDTO> categories = categoryService.getCategories(type);
        return ResponseEntity.ok(ApiResponse.of(CategoryResponseCode.GET_LIST_SUCCESS, categories));
    }

    @Operation(summary = "2. Get category by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CategoryResponseDTO>> getCategoryById(@PathVariable Long id) {
        CategoryResponseDTO category = categoryService.getCategoryById(id);
        return ResponseEntity.ok(ApiResponse.of(CategoryResponseCode.GET_SUCCESS, category));
    }
}
