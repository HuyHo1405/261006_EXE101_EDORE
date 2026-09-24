package com.edore.backend.features.course.controller;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.course.code.CourseResponseCode;
import com.edore.backend.features.course.dto.request.AssignClassConfigRequestDTO;
import com.edore.backend.features.course.dto.request.CourseFilterRequestDTO;
import com.edore.backend.features.course.dto.request.CourseRequestDTO;
import com.edore.backend.features.course.dto.response.CourseDetailResponseDTO;
import com.edore.backend.features.course.dto.response.CourseResponseDTO;
import com.edore.backend.features.course.security.CoursePermissions;
import com.edore.backend.features.course.service.CourseService;
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
@RequestMapping("/api/courses")
@Tag(   name = "6. Course APIs", 
        description = "User Course management — workspace for teaching scripts")
@RequiredArgsConstructor
public class CourseController {

    private final CourseService courseService;

    @Operation( summary = "1. Get course enum options",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.of(CourseResponseCode.GET_SUCCESS, courseService.getEnums()));
    }
    
    @Operation( summary = "2. Create course",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + CoursePermissions.CREATE + "') or hasRole('USER')")
    @PostMapping
    public ResponseEntity<ApiResponse<CourseDetailResponseDTO>> create(
            @CurrentUser UUID userId,
            @Valid @RequestBody CourseRequestDTO request) {
        CourseDetailResponseDTO result = courseService.create(userId, request);
        return ResponseEntity.status(201).body(
                ApiResponse.of(CourseResponseCode.CREATED, result));
    }

    @Operation( summary = "3. Search and filter my courses (Paged)",
                description = "Returns courses owned by the current authenticated user.",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + CoursePermissions.READ_OWN + "') or hasRole('USER')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<CourseResponseDTO>>> getMyCourses(
            @CurrentUser UUID userId,
            @org.springdoc.core.annotations.ParameterObject @Valid CourseFilterRequestDTO filter) {
        return ResponseEntity.ok(
                ApiResponse.of(CourseResponseCode.GET_LIST_SUCCESS, courseService.getByUser(userId, filter)));
    }


    @Operation( summary = "4. Get course by ID",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + CoursePermissions.READ_OWN + "') or hasRole('USER')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDetailResponseDTO>> getById(
            @PathVariable UUID id,
            @CurrentUser UUID userId) {
        return ResponseEntity.ok(
                ApiResponse.of(CourseResponseCode.GET_SUCCESS, courseService.getById(id, userId)));
    }


    @Operation( summary = "5. Update course",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + CoursePermissions.WRITE_OWN + "') or hasRole('USER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDetailResponseDTO>> update(
            @PathVariable UUID id,
            @CurrentUser UUID userId,
            @Valid @RequestBody CourseRequestDTO request) {
        CourseDetailResponseDTO result = courseService.update(id, userId, request);
        return ResponseEntity.ok(ApiResponse.of(CourseResponseCode.UPDATED, result));
    }

    @Operation( summary = "6. Assign class config to course",
                description = "Assign or replace the ClassConfig for this course (clones snapshot). Only the owner can do this.",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + CoursePermissions.WRITE_OWN + "') or hasRole('USER')")
    @PutMapping("/{id}/class-config")
    public ResponseEntity<ApiResponse<CourseDetailResponseDTO>> assignClassConfig(
            @PathVariable UUID id,
            @CurrentUser UUID userId,
            @Valid @RequestBody AssignClassConfigRequestDTO request) {
        CourseDetailResponseDTO result = courseService.assignClassConfig(id, userId, request.classConfigId());
        return ResponseEntity.ok(ApiResponse.of(CourseResponseCode.CLASS_CONFIG_ASSIGNED, result));
    }

    @Operation( summary = "7. Delete course",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + CoursePermissions.DELETE_OWN + "') or hasRole('USER')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(
            @PathVariable UUID id,
            @CurrentUser UUID userId) {
        courseService.delete(id, userId);
        return ResponseEntity.ok(ApiResponse.of(CourseResponseCode.DELETED));
    }
}
