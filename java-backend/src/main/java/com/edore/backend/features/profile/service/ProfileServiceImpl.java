package com.edore.backend.features.profile.service;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.profile.code.ProfileResponseCode;
import com.edore.backend.features.profile.dto.request.ProfileUpdateRequest;
import com.edore.backend.features.profile.dto.response.ProfileResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;

    @Override
    public ProfileResponse getProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ProfileResponseCode.PROFILE_USER_NOT_FOUND));
        return new ProfileResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone()
        );
    }

    @Override
    @Transactional
    public void updateProfile(UUID id, ProfileUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(ProfileResponseCode.PROFILE_USER_NOT_FOUND));

        userRepository.findByEmail(request.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ApiException(ProfileResponseCode.PROFILE_EMAIL_ALREADY_EXISTS);
            }
        });

        userRepository.findByPhone(request.phone()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ApiException(ProfileResponseCode.PROFILE_PHONE_ALREADY_EXISTS);
            }
        });

        user.setUsername(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        userRepository.save(user);
    }
}
