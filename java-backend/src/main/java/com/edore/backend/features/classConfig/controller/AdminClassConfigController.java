package com.edore.backend.features.classConfig.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.classConfig.code.ClassConfigResponseCode;
import com.edore.backend.features.classConfig.dto.request.AdminClassConfigFilterRequestDTO;
import com.edore.backend.features.classConfig.dto.response.ClassConfigResponseDTO;
import com.edore.backend.features.classConfig.service.ClassConfigService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@RequestMapping("/api/admin/class-configs")
@Tag(   name = "A3. Admin ClassConfig APIs", 
        description = "Admin management of all system classroom configurations")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class AdminClassConfigController {

    private final ClassConfigService classConfigService;

    @Operation( summary = "1. Search and filter all system class configs (Admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ClassConfigResponseDTO>>> getAllClassConfigs(
            @org.springdoc.core.annotations.ParameterObject @Valid AdminClassConfigFilterRequestDTO filter) {
        return ResponseEntity.ok(
                ApiResponse.of(ClassConfigResponseCode.GET_LIST_SUCCESS, classConfigService.getByUser(filter.userId(), filter.toUserFilter())));
    }


    @Operation( summary = "2. Get any class config by ID (Admin)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassConfigResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.of(ClassConfigResponseCode.GET_SUCCESS, classConfigService.getById(id)));
    }
}
