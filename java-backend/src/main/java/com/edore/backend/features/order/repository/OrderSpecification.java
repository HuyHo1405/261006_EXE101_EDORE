package com.edore.backend.features.order.repository;

import com.edore.backend.features.order.dto.request.OrderFilterRequestDTO;
import com.edore.backend.features.order.entity.Order;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class OrderSpecification {

    public static Specification<Order> filter(UUID targetUserId, OrderFilterRequestDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User ID filter (either explicit targetUserId or filter.userId)
            UUID effectiveUserId = targetUserId != null ? targetUserId : (filter != null ? filter.userId() : null);
            if (effectiveUserId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), effectiveUserId));
            }

            if (filter != null) {
                // 2. Status filter
                if (filter.status() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.status()));
                }

                // 3. Subscription Plan ID filter
                if (filter.subscriptionPlanId() != null) {
                    predicates.add(cb.equal(root.get("subscriptionPlan").get("id"), filter.subscriptionPlanId()));
                }

                // 4. Date range filters
                if (filter.fromDate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.fromDate()));
                }
                if (filter.toDate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.toDate()));
                }

                // 5. Keyword search filter
                if (filter.search() != null && !filter.search().isBlank()) {
                    String searchPattern = "%" + filter.search().trim().toLowerCase() + "%";

                    Predicate searchCode = cb.like(cb.lower(root.get("gatewayOrderCode")), searchPattern);
                    Predicate searchEmail = cb.like(cb.lower(root.get("user").get("email")), searchPattern);
                    Predicate searchUsername = cb.like(cb.lower(root.get("user").get("username")), searchPattern);

                    predicates.add(cb.or(searchCode, searchEmail, searchUsername));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
