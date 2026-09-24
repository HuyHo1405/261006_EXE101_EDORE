package com.edore.backend.features.user.dto.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@AllArgsConstructor
@NoArgsConstructor
public class UserSettingsUpdateRequest {
    private Boolean enableFactCheckVerification;
    private String theme;
    private String language;
}
