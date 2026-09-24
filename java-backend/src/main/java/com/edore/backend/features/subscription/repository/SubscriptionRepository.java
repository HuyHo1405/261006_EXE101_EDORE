package com.edore.backend.features.subscription.repository;

import com.edore.backend.features.subscription.entity.Subscription;
import com.edore.backend.features.subscription.model.SubscriptionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.Instant;
import java.util.UUID;

public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {

    boolean existsByUserIdAndStatusAndEndDateAfter(UUID userId, SubscriptionStatus status, Instant now);
}
