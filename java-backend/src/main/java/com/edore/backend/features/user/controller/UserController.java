package com.edore.backend.features.user.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.user.code.UserResponseCode;
import com.edore.backend.features.user.dto.request.UserSettingsUpdateRequest;
import com.edore.backend.features.user.dto.request.UserUpdateRequest;
import com.edore.backend.features.user.dto.response.UserResponse;
import com.edore.backend.features.user.dto.response.UserSettingsResponse;
import com.edore.backend.features.user.entity.UserSettings;
import com.edore.backend.features.user.repository.UserSettingsRepository;
import com.edore.backend.features.user.security.UserPermissions;
import com.edore.backend.features.user.service.UserService;
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
@RequestMapping("/api/users")
@Tag(   name = "2. User APIs",
        description = "User profile management APIs (/api/users/me)")
@RequiredArgsConstructor
public class UserController {

    private final UserService          userService;
    private final UserSettingsRepository userSettingsRepository;

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
        UserSettings settings = userSettingsRepository.findById(userId)
                .orElseGet(() -> userSettingsRepository.save(UserSettings.builder().userId(userId).build()));

        UserSettingsResponse response = UserSettingsResponse.builder()
                .userId(settings.getUserId())
                .enableFactCheckVerification(settings.getEnableFactCheckVerification())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .build();

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

        UserSettings settings = userSettingsRepository.findById(userId)
                .orElseGet(() -> UserSettings.builder().userId(userId).build());

        if (request.getEnableFactCheckVerification() != null) {
            settings.setEnableFactCheckVerification(request.getEnableFactCheckVerification());
        }
        if (request.getTheme() != null) {
            settings.setTheme(request.getTheme());
        }
        if (request.getLanguage() != null) {
            settings.setLanguage(request.getLanguage());
        }

        userSettingsRepository.save(settings);

        UserSettingsResponse response = UserSettingsResponse.builder()
                .userId(settings.getUserId())
                .enableFactCheckVerification(settings.getEnableFactCheckVerification())
                .theme(settings.getTheme())
                .language(settings.getLanguage())
                .build();

        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.UPDATE_PROFILE_SUCCESS, response));
    }
}
