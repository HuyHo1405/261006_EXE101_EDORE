package com.edore.backend.features.classConfig.dto.response;

import com.edore.backend.features.classConfig.model.*;

import java.time.Instant;
import java.util.List;
import java.util.UUID;

public record ClassConfigResponseDTO(
        Long id,
        UUID userId,
        String name,
        LessonDuration duration,
        ClassSizeRange classSize,
        ClassroomSpace space,
        SeatingLayout seatingLayout,
        List<InfrastructureItem> infrastructure,
        List<StudentDeviceOption> studentDevices,
        Instant createdAt
) {}
