package com.edore.backend.features.profile.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.auth.security.CustomUserDetail;
import com.edore.backend.features.profile.code.ProfileResponseCode;
import com.edore.backend.features.profile.dto.request.ProfileUpdateRequest;
import com.edore.backend.features.profile.dto.response.ProfileResponse;
import com.edore.backend.features.profile.security.ProfilePermissions;
import com.edore.backend.features.profile.service.ProfileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/profile")
@Tag(name = "Profile APIs", description = "User profile APIs")
@RequiredArgsConstructor
public class ProfileController {

    private final ProfileService profileService;

    @Operation(summary = "Get own profile", security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ProfilePermissions.READ_OWN + "')")
    @GetMapping
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfile(@CurrentUser UUID userId) {
        ProfileResponse profile = profileService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.of(ProfileResponseCode.GET_PROFILE_SUCCESS, profile));
    }

    @Operation(summary = "Update own profile", security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ProfilePermissions.WRITE_OWN + "')")
    @PutMapping
    public ResponseEntity<ApiResponse<Void>> updateProfile(
            @CurrentUser UUID userId,
            @Valid @RequestBody ProfileUpdateRequest request) {
        profileService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.of(ProfileResponseCode.UPDATE_PROFILE_SUCCESS));
    }

    @Operation(summary = "Get profile by ID", description = "Requires ADMIN or exact owner",
            security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ProfilePermissions.READ_ANY + "') or @profileSecurity.isOwner(authentication, #id)")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ProfileResponse>> getProfileById(@PathVariable UUID id) {
        ProfileResponse profile = profileService.getProfile(id);
        return ResponseEntity.ok(ApiResponse.of(ProfileResponseCode.GET_PROFILE_SUCCESS, profile));
    }

    @Operation(summary = "Update profile by ID", description = "Requires ADMIN or exact owner",
            security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + ProfilePermissions.WRITE_ANY + "') or @profileSecurity.isOwner(authentication, #id)")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateProfileById(
            @PathVariable UUID id,
            @Valid @RequestBody ProfileUpdateRequest request) {
        profileService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.of(ProfileResponseCode.UPDATE_PROFILE_SUCCESS));
    }
}
