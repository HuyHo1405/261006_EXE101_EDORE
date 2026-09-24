package com.edore.backend.features.classConfig.repository;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.features.classConfig.model.*;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class ClassConfigEnumRegistry {

    public List<EnumResponseDTO> getClassConfigEnums() {
        return List.of(
                new EnumResponseDTO("LessonDuration", Arrays.stream(LessonDuration.values()).map(Enum::name).toList()),
                new EnumResponseDTO("ClassSizeRange", Arrays.stream(ClassSizeRange.values()).map(Enum::name).toList()),
                new EnumResponseDTO("ClassroomSpace", Arrays.stream(ClassroomSpace.values()).map(Enum::name).toList()),
                new EnumResponseDTO("SeatingLayout", Arrays.stream(SeatingLayout.values()).map(Enum::name).toList()),
                new EnumResponseDTO("InfrastructureItem", Arrays.stream(InfrastructureItem.values()).map(Enum::name).toList()),
                new EnumResponseDTO("StudentDeviceOption", Arrays.stream(StudentDeviceOption.values()).map(Enum::name).toList())
        );
    }
}
