package com.edore.backend.features.user.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSettingsResponse {
    private UUID userId;
    private Boolean enableFactCheckVerification;
    private String theme;
    private String language;
}
