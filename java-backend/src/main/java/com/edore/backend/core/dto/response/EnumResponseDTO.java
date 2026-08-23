package com.edore.backend.core.dto.response;

import java.util.List;

public record EnumResponseDTO(
        String name,
        List<String> value
) {
}
