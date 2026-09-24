package com.edore.backend.features.classConfig.controller;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.classConfig.code.ClassConfigResponseCode;
import com.edore.backend.features.classConfig.dto.request.ClassConfigFilterRequestDTO;
import com.edore.backend.features.classConfig.dto.request.ClassConfigRequestDTO;
import com.edore.backend.features.classConfig.dto.response.ClassConfigResponseDTO;
import com.edore.backend.features.classConfig.security.ClassConfigPermissions;
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

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/class-configs")
@Tag(   name = "5. ClassConfig APIs", 
        description = "Classroom configuration management — create and reuse classroom setups across courses")
@RequiredArgsConstructor
public class ClassConfigController {

    private final ClassConfigService classConfigService;

    @Operation( summary = "1. Get classroom config enum options for UI dropdowns",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.of(ClassConfigResponseCode.GET_SUCCESS, classConfigService.getEnums()));
    }

    @Operation( summary = "2. Create class config",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ClassConfigPermissions.CREATE + "') or hasRole('ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<ClassConfigResponseDTO>> create(
            @CurrentUser UUID userId,
            @Valid @RequestBody ClassConfigRequestDTO request) {
        ClassConfigResponseDTO result = classConfigService.create(userId, request);
        return ResponseEntity.status(201).body(
                ApiResponse.of(ClassConfigResponseCode.CREATED, result));
    }

    @Operation( summary = "3. Get my class configs (Paged)",
                description = "Returns class configs owned by the authenticated user with search/pagination.",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ClassConfigPermissions.READ_OWN + "') or hasRole('USER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ClassConfigResponseDTO>>> getMine(
            @CurrentUser UUID userId,
            @org.springdoc.core.annotations.ParameterObject @Valid ClassConfigFilterRequestDTO filter) {
        return ResponseEntity.ok(
                ApiResponse.of(ClassConfigResponseCode.GET_LIST_SUCCESS, classConfigService.getByUser(userId, filter)));
    }



    @Operation( summary = "4. Get class config by ID",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ClassConfigPermissions.READ_OWN + "') or hasRole('USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassConfigResponseDTO>> getById(
            @PathVariable Long id,
            @CurrentUser UUID userId) {
        return ResponseEntity.ok(
                ApiResponse.of(ClassConfigResponseCode.GET_SUCCESS, classConfigService.getById(id, userId)));
    }

    

    @Operation( summary = "5. Update class config",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ClassConfigPermissions.WRITE_OWN + "') or hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ClassConfigResponseDTO>> update(
            @PathVariable Long id,
            @CurrentUser UUID userId,
            @Valid @RequestBody ClassConfigRequestDTO request) {
        ClassConfigResponseDTO result = classConfigService.update(id, userId, request);
        return ResponseEntity.ok(ApiResponse.of(ClassConfigResponseCode.UPDATED, result));
    }

    @Operation( summary = "6. Delete class config",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ClassConfigPermissions.DELETE_OWN + "') or hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable Long id,
            @CurrentUser UUID userId) {
        classConfigService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.of(ClassConfigResponseCode.DELETED));
    }
}

