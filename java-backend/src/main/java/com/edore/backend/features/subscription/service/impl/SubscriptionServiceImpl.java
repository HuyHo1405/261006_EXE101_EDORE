package com.edore.backend.features.subscription.service.impl;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.script.repository.ScriptRepository;
import com.edore.backend.features.subscription.code.SubscriptionResponseCode;
import com.edore.backend.features.subscription.dto.response.SubscriptionStatusResponseDTO;
import com.edore.backend.features.subscription.entity.Subscription;
import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.model.SubscriptionStatus;
import com.edore.backend.features.subscription.repository.SubscriptionRepository;
import com.edore.backend.features.subscription.service.SubscriptionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Optional;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class SubscriptionServiceImpl implements SubscriptionService {

    private final SubscriptionRepository subscriptionRepository;
    private final CourseRepository       courseRepository;
    private final ScriptRepository       scriptRepository;

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    @Transactional(readOnly = true)
    public Optional<Subscription> getActiveSubscription(UUID userId) {
        return subscriptionRepository.findTopByUserIdAndStatusAndEndDateAfterOrderByEndDateDesc(
                userId, SubscriptionStatus.ACTIVE, Instant.now());
    }

    @Override
    @Transactional(readOnly = true)
    public void assertCourseCreationAllowed(UUID userId) {
        if (isAdmin()) return;

        Subscription sub = getActiveSubscription(userId)
                .orElseThrow(() -> new ApiException(SubscriptionResponseCode.NO_ACTIVE_SUBSCRIPTION));

        SubscriptionPlan plan = sub.getSubscriptionPlan();
        if (plan.getMaxCourses() == null) return; // null = unlimited

        long currentCount = courseRepository.countByUserId(userId);
        if (currentCount >= plan.getMaxCourses()) {
            log.warn("[Subscription] Course limit reached for userId={} plan={} limit={} current={}",
                    userId, plan.getName(), plan.getMaxCourses(), currentCount);
            throw new ApiException(SubscriptionResponseCode.COURSE_LIMIT_EXCEEDED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public void assertScriptCreationAllowed(UUID courseId, UUID userId) {
        if (isAdmin()) return;

        Subscription sub = getActiveSubscription(userId)
                .orElseThrow(() -> new ApiException(SubscriptionResponseCode.NO_ACTIVE_SUBSCRIPTION));

        SubscriptionPlan plan = sub.getSubscriptionPlan();
        if (plan.getMaxScriptsPerCourse() == null) return; // null = unlimited

        int currentCount = scriptRepository.countByCourseId(courseId);
        if (currentCount >= plan.getMaxScriptsPerCourse()) {
            log.warn("[Subscription] Script limit reached for courseId={} userId={} plan={} limit={} current={}",
                    courseId, userId, plan.getName(), plan.getMaxScriptsPerCourse(), currentCount);
            throw new ApiException(SubscriptionResponseCode.SCRIPT_LIMIT_EXCEEDED);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public SubscriptionStatusResponseDTO getMySubscriptionStatus(UUID userId) {
        Optional<Subscription> activeSub = getActiveSubscription(userId);

        if (activeSub.isEmpty()) {
            // Return a "no subscription" summary without throwing — useful for display only
            long courseCount = courseRepository.countByUserId(userId);
            return new SubscriptionStatusResponseDTO(
                    null, null, null, null, courseCount, null, null, "NONE"
            );
        }

        Subscription sub = activeSub.get();
        SubscriptionPlan plan = sub.getSubscriptionPlan();
        long courseCount = courseRepository.countByUserId(userId);

        return new SubscriptionStatusResponseDTO(
                plan.getName(),
                plan.getDescription(),
                plan.getMaxCourses(),
                plan.getMaxScriptsPerCourse(),
                courseCount,
                sub.getStartDate(),
                sub.getEndDate(),
                sub.getStatus().name()
        );
    }

    // ── Private helpers ───────────────────────────────────────────────────────

    /**
     * Returns true if the currently authenticated principal has ROLE_ADMIN.
     * Admins bypass all subscription quota checks.
     */
    private boolean isAdmin() {
        try {
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            if (auth == null || !auth.isAuthenticated()) return false;
            return auth.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        } catch (Exception e) {
            log.warn("[Subscription] Could not resolve admin role, defaulting to non-admin: {}", e.getMessage());
            return false;
        }
    }
}
