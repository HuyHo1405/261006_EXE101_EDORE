package com.edore.backend.features.user.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.user.code.UserResponseCode;
import com.edore.backend.features.user.dto.request.UserFilterRequestDTO;
import com.edore.backend.features.user.dto.request.UserUpdateRequest;
import com.edore.backend.features.user.dto.response.UserResponse;
import com.edore.backend.features.user.security.UserPermissions;
import com.edore.backend.features.user.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/users")
@Tag(   name = "A1. Admin User APIs", 
        description = "Admin user management APIs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminUserController {

    private final UserService userService;

    @Operation( summary = "1. Get all users (Admin - paginated & filtered)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + UserPermissions.READ_ANY + "') or hasRole('ADMIN')")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<UserResponse>>> getAllUsers(
            @ParameterObject @Valid UserFilterRequestDTO filter) {
        PageResponseDTO<UserResponse> page = userService.getAllUsersForAdmin(filter);
        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.GET_PROFILE_SUCCESS, page));
    }

    @Operation( summary = "2. Get user profile by ID (Admin)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + UserPermissions.READ_ANY + "') or hasRole('ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable UUID id) {
        UserResponse profile = userService.getProfile(id);
        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.GET_PROFILE_SUCCESS, profile));
    }

    @Operation( summary = "3. Update user profile by ID (Admin)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + UserPermissions.WRITE_ANY + "') or hasRole('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> updateUserById(
            @PathVariable UUID id,
            @Valid @RequestBody UserUpdateRequest request) {
        userService.updateProfile(id, request);
        return ResponseEntity.ok(ApiResponse.of(UserResponseCode.UPDATE_PROFILE_SUCCESS));
    }
}
