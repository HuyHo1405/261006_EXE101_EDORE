package com.edore.backend.features.activity.service;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.activity.dto.request.ActivityFilterRequestDTO;
import com.edore.backend.features.activity.dto.request.ActivityRequestDTO;
import com.edore.backend.features.activity.dto.response.ActivityDetailResponseDTO;
import com.edore.backend.features.activity.dto.response.ActivityResponseDTO;

/**
 * CRUD service for Activity (teaching activity pool).
 * CREATE / UPDATE / DELETE are Admin-only; READ is authenticated users.
 */
public interface ActivityService {

    ActivityDetailResponseDTO create(ActivityRequestDTO request);

    ActivityDetailResponseDTO getDetail(Long id);

    PageResponseDTO<ActivityResponseDTO> getActivities(ActivityFilterRequestDTO filter);

    ActivityDetailResponseDTO update(Long id, ActivityRequestDTO request);

    void delete(Long id);
}
