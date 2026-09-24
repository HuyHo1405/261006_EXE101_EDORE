package com.edore.backend.features.course.repository;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.features.course.entity.CourseStatus;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;

@Component
public class CourseEnumRegistry {

    public List<EnumResponseDTO> getCourseEnums() {
        return List.of(
                new EnumResponseDTO("CourseStatus", Arrays.stream(CourseStatus.values()).map(Enum::name).toList())
        );
    }
}
