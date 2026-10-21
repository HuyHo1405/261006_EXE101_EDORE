package com.edore.backend.features.user.service;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.user.code.UserResponseCode;
import com.edore.backend.features.user.dto.request.UserSettingsUpdateRequest;
import com.edore.backend.features.user.dto.response.UserSettingsResponse;
import com.edore.backend.features.user.entity.UserSettings;
import com.edore.backend.features.user.repository.UserSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional
public class UserSettingsService {
    private final UserRepository users;
    private final UserSettingsRepository settings;

    public UserSettingsResponse get(UUID userId) {
        return toResponse(loadOrCreate(userId));
    }

    public UserSettingsResponse update(UUID userId, UserSettingsUpdateRequest request) {
        UserSettings current = loadOrCreate(userId);
        if (request.getEnableFactCheckVerification() != null)
            current.setEnableFactCheckVerification(request.getEnableFactCheckVerification());
        if (request.getTheme() != null) current.setTheme(request.getTheme());
        if (request.getLanguage() != null) current.setLanguage(request.getLanguage());
        return toResponse(current);
    }

    private UserSettings loadOrCreate(UUID userId) {
        // Lock the existing parent: the settings row may not exist yet to lock.
        // Both GET and PATCH take this lock before checking/creating settings.
        var user = users.findForSettingsById(userId)
                .orElseThrow(() -> new ApiException(UserResponseCode.USER_NOT_FOUND));
        return settings.findById(userId).orElseGet(() -> {
            // @MapsId derives user_id from this association, not a standalone UUID.
            var created = settings.save(UserSettings.builder().user(user).build());
            user.setSettings(created);
            return created;
        });
    }

    private UserSettingsResponse toResponse(UserSettings current) {
        return UserSettingsResponse.builder().userId(current.getUserId())
                .enableFactCheckVerification(current.getEnableFactCheckVerification())
                .theme(current.getTheme()).language(current.getLanguage()).build();
    }
}
