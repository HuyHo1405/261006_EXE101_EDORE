package com.edore.backend.features.activity.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.activity.code.ActivityResponseCode;
import com.edore.backend.features.activity.dto.request.ActivityFilterRequestDTO;
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
@RequestMapping("/api/activities")
@Tag(    name = "8. Activity APIs",
         description = "Activity pool — browse teaching activities compatible with your classroom setup")
@RequiredArgsConstructor
public class ActivityController {

    private final ActivityService activityService;

    @Operation( summary = "1. Browse all activities (paginated & filtered)",
                description = "Returns all activities in the pool. Filter by nodeType, space, duration, classSize, or keyword search.",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("isAuthenticated()")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<ActivityResponseDTO>>> getActivities(
            @org.springdoc.core.annotations.ParameterObject @Valid ActivityFilterRequestDTO filter) {
        return ResponseEntity.ok(
                ApiResponse.of(ActivityResponseCode.GET_LIST_SUCCESS, activityService.getActivities(filter)));
    }

    @Operation( summary = "2. Get activity by ID",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ActivityDetailResponseDTO>> getById(@PathVariable Long id) {
        return ResponseEntity.ok(
                ApiResponse.of(ActivityResponseCode.GET_SUCCESS, activityService.getDetail(id)));
    }
}
