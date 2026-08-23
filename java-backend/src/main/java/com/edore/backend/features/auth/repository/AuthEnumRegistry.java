package com.edore.backend.features.auth.repository;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.features.auth.model.OtpType;
import com.edore.backend.features.auth.model.RoleName;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class AuthEnumRegistry {

    public List<EnumResponseDTO> getAuthEnums() {
        return List.of(
                new EnumResponseDTO("RoleName", Arrays.stream(RoleName.values()).map(Enum::name).toList()),
                new EnumResponseDTO("OtpType", Arrays.stream(OtpType.values()).map(Enum::name).toList())
        );
    }
}
