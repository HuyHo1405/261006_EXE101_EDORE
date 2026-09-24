package com.edore.backend.features.classConfig.service;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.classConfig.dto.request.ClassConfigFilterRequestDTO;
import com.edore.backend.features.classConfig.dto.request.ClassConfigRequestDTO;
import com.edore.backend.features.classConfig.dto.response.ClassConfigResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ClassConfigService {

    ClassConfigResponseDTO create(UUID userId, ClassConfigRequestDTO request);

    ClassConfigResponseDTO getById(Long id, UUID userId);

    ClassConfigResponseDTO getById(Long id); // Admin / internal lookup


    PageResponseDTO<ClassConfigResponseDTO> getClassConfigs(ClassConfigFilterRequestDTO filter);

    PageResponseDTO<ClassConfigResponseDTO> getByUser(UUID userId, ClassConfigFilterRequestDTO filter);

    ClassConfigResponseDTO update(Long id, UUID userId, ClassConfigRequestDTO request);

    void delete(Long id, UUID userId);

    List<EnumResponseDTO> getEnums();
}




