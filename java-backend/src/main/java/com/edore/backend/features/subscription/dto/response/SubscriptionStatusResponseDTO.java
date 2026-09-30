package com.edore.backend.features.subscription.dto.response;

import java.time.Instant;

/**
 * DTO for GET /api/v1/subscriptions/me — user's current active subscription status.
 */
public record SubscriptionStatusResponseDTO(
        String planName,
        String planDescription,
        Integer maxCourses,
        Integer maxScriptsPerCourse,
        long currentCourseCount,
        Instant startDate,
        Instant endDate,
        String status
) {}
