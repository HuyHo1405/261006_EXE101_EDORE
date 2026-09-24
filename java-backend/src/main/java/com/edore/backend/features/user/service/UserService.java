package com.edore.backend.features.user.service;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.user.dto.request.UserFilterRequestDTO;
import com.edore.backend.features.user.dto.request.UserUpdateRequest;
import com.edore.backend.features.user.dto.response.UserResponse;

import java.util.UUID;

public interface UserService {

    UserResponse getProfile(UUID id);

    void updateProfile(UUID id, UserUpdateRequest request);

    PageResponseDTO<UserResponse> getAllUsersForAdmin(UserFilterRequestDTO filter);
}
