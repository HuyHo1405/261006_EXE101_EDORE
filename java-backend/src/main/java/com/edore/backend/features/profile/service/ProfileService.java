package com.edore.backend.features.profile.service;

import com.edore.backend.features.profile.dto.request.ProfileUpdateRequest;
import com.edore.backend.features.profile.dto.response.ProfileResponse;

import java.util.UUID;

public interface ProfileService {

    ProfileResponse getProfile(UUID id);

    void updateProfile(UUID id, ProfileUpdateRequest request);
}
