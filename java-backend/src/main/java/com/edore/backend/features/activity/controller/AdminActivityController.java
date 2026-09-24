package com.edore.backend.features.activity.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.activity.code.ActivityResponseCode;
import com.edore.backend.features.activity.dto.request.ActivityFilterRequestDTO;
import com.edore.backend.features.activity.dto.request.ActivityRequestDTO;
import com.edore.backend.features.activity.dto.response.ActivityDetailResponseDTO;
import com.edore.backend.features.activity.dto.response.ActivityResponseDTO;
import com.edore.backend.features.activity.service.ActivityService;
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
@RequestMapping("/api/admin/activities")
@Tag(    name = "A5. Admin Activity APIs",
         description = "Admin management of the activity pool (full CRUD)")
@PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class AdminActivityController {

    private final ActivityService activityService;

    @Operation(summary = "1. Create activity")
    @PostMapping
    public ResponseEntity<ApiResponse<ActivityDetailResponseDTO>> create(
            @Valid @RequestBody ActivityRequestDTO request) {
        ActivityDetailResponseDTO result = activityService.create(request);
        return ResponseEntity.status(201).body(
                ApiResponse.of(ActivityResponseCode.CREATED, result));
    }

    @Operation(summary = "2. Search and filter all activities (Admin)")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ActivityResponseDTO>>> getAll(
            @org.springdoc.core.annotations.ParameterObject @Valid ActivityFilterRequestDTO filter) {
        return ResponseEntity.ok(
                ApiResponse.of(ActivityResponseCode.GET_LIST_SUCCESS, activityService.getActivities(filter)));
    }

    @Operation(summary = "3. Get activity by ID (Admin)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDetailResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.of(ActivityResponseCode.GET_SUCCESS, activityService.getDetail(id)));
    }

    @Operation(summary = "4. Update activity")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDetailResponseDTO>> update(
            @PathVariable Long id,
            @Valid @RequestBody ActivityRequestDTO request) {
        ActivityDetailResponseDTO result = activityService.update(id, request);
        return ResponseEntity.ok(ApiResponse.of(ActivityResponseCode.UPDATED, result));
    }

    @Operation(summary = "5. Delete activity")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> delete(@PathVariable Long id) {
        activityService.delete(id);
        return ResponseEntity.ok(ApiResponse.of(ActivityResponseCode.DELETED));
    }
}
