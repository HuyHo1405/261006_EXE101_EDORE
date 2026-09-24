package com.edore.backend.features.course.service;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.course.dto.request.CourseFilterRequestDTO;
import com.edore.backend.features.course.dto.request.CourseRequestDTO;
import com.edore.backend.features.course.dto.response.CourseDetailResponseDTO;
import com.edore.backend.features.course.dto.response.CourseResponseDTO;

import java.util.List;
import java.util.UUID;

public interface CourseService {

    CourseDetailResponseDTO create(UUID userId, CourseRequestDTO request);

    CourseDetailResponseDTO getById(UUID id, UUID userId);

    CourseDetailResponseDTO getById(UUID id); // Admin / internal lookup

    PageResponseDTO<CourseResponseDTO> getCourses(CourseFilterRequestDTO filter);

    PageResponseDTO<CourseResponseDTO> getByUser(UUID userId, CourseFilterRequestDTO filter);

    CourseDetailResponseDTO update(UUID id, UUID userId, CourseRequestDTO request);

    CourseDetailResponseDTO assignClassConfig(UUID courseId, UUID userId, Long classConfigId);

    void delete(UUID id, UUID userId);

    List<EnumResponseDTO> getEnums();
}
