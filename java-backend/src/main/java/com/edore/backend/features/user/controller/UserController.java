package com.edore.backend.features.user.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.user.code.UserResponseCode;
import com.edore.backend.features.user.dto.request.UserSettingsUpdateRequest;
import com.edore.backend.features.user.dto.request.UserUpdateRequest;
import com.edore.backend.features.user.dto.response.UserResponse;
import com.edore.backend.features.user.dto.response.UserSettingsResponse;
import com.edore.backend.features.user.security.UserPermissions;
import com.edore.backend.features.user.service.UserService;
import com.edore.backend.features.user.service.UserSettingsService;
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
@RequestMapping("/api/v1/users")
@Tag(   name = "02. User APIs",
        description = "User profile management APIs (/api/v1/users/me)")
@RequiredArgsConstructor
public class UserController {

    private final UserService          userService;
    private final UserSettingsService userSettingsService;

    @Operation( summary = "1. Get own profile",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + UserPermissions.READ_OWN + "')")
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getOwnProfile(@CurrentUser UUID userId) {
        UserResponse profile = userService.getProfile(userId);
        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.GET_PROFILE_SUCCESS, profile));
    }

    @Operation( summary = "2. Update own profile",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + UserPermissions.WRITE_OWN + "')")
    @PutMapping("/me")
    public ResponseEntity<ApiResponse<Void>> updateOwnProfile(
            @CurrentUser UUID userId,
            @Valid @RequestBody UserUpdateRequest request) {
        userService.updateProfile(userId, request);
        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.UPDATE_PROFILE_SUCCESS));
    }

    @Operation(
        summary     = "3. Get user settings",
        security    = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PreAuthorize("hasAuthority('" + UserPermissions.READ_OWN + "')")
    @GetMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettingsResponse>> getUserSettings(
            @CurrentUser UUID userId) {
        UserSettingsResponse response = userSettingsService.get(userId);

        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.GET_PROFILE_SUCCESS, response));
    }

    @Operation(
        summary     = "4. Update user settings",
        description = "Patch user-level settings (enableFactCheckVerification, theme, language).",
        security    = @SecurityRequirement(name = "Bearer Authentication")
    )
    @PreAuthorize("hasAuthority('" + UserPermissions.WRITE_OWN + "')")
    @PatchMapping("/me/settings")
    public ResponseEntity<ApiResponse<UserSettingsResponse>> updateUserSettings(
            @CurrentUser UUID userId,
            @RequestBody UserSettingsUpdateRequest request) {

        UserSettingsResponse response = userSettingsService.update(userId, request);

        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.UPDATE_PROFILE_SUCCESS, response));
    }
}
