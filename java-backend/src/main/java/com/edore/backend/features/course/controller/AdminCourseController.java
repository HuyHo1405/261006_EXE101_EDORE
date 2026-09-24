package com.edore.backend.features.course.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.course.code.CourseResponseCode;
import com.edore.backend.features.course.dto.request.AdminCourseFilterRequestDTO;
import com.edore.backend.features.course.dto.response.CourseDetailResponseDTO;
import com.edore.backend.features.course.dto.response.CourseResponseDTO;
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

import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/admin/courses")
@Tag(   name = "A4. Admin Course APIs", 
        description = "Admin management of all system courses")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class AdminCourseController {

    private final CourseService courseService;

    @Operation( summary = "1. Search and filter all system courses (Admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<CourseResponseDTO>>> getAllCourses(
            @org.springdoc.core.annotations.ParameterObject @Valid AdminCourseFilterRequestDTO filter) {
        return ResponseEntity.ok(
                ApiResponse.of(CourseResponseCode.GET_LIST_SUCCESS, courseService.getByUser(filter.userId(), filter.toUserFilter())));
    }


    @Operation( summary = "2. Get any course by ID (Admin)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CourseDetailResponseDTO>> getById(@PathVariable UUID id) {
        return ResponseEntity.ok(
                ApiResponse.of(CourseResponseCode.GET_SUCCESS, courseService.getById(id)));
    }
}
