package com.edore.backend.features.subscription.service;

import com.edore.backend.features.subscription.dto.response.SubscriptionStatusResponseDTO;
import com.edore.backend.features.subscription.entity.Subscription;

import java.util.Optional;
import java.util.UUID;

/**
 * Subscription domain service — quota checks and status queries.
 */
public interface SubscriptionService {

    /**
     * Returns the current ACTIVE subscription for the user (end date in the future), if any.
     */
    Optional<Subscription> getActiveSubscription(UUID userId);

    /**
     * Asserts the user has not exceeded their plan's maxCourses limit.
     * Admin users bypass this check.
     *
     * @throws com.edore.backend.core.exception.ApiException on violation
     */
    void assertCourseCreationAllowed(UUID userId);

    /**
     * Asserts the course has not exceeded the user's plan's maxScriptsPerCourse limit.
     * Admin users bypass this check.
     *
     * @throws com.edore.backend.core.exception.ApiException on violation
     */
    void assertScriptCreationAllowed(UUID courseId, UUID userId);

    /**
     * Returns a summary of the user's current subscription status and plan limits.
     */
    SubscriptionStatusResponseDTO getMySubscriptionStatus(UUID userId);
}
