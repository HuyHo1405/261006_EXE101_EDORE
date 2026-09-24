package com.edore.backend.features.order.repository;

import com.edore.backend.features.order.dto.request.PaymentFilterRequestDTO;
import com.edore.backend.features.order.entity.Payment;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class PaymentSpecification {

    public static Specification<Payment> filter(UUID targetUserId, PaymentFilterRequestDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User ID filter
            UUID effectiveUserId = targetUserId != null ? targetUserId : (filter != null ? filter.userId() : null);
            if (effectiveUserId != null) {
                predicates.add(cb.equal(root.get("order").get("user").get("id"), effectiveUserId));
            }

            if (filter != null) {
                // 2. Order ID filter
                if (filter.orderId() != null) {
                    predicates.add(cb.equal(root.get("order").get("id"), filter.orderId()));
                }

                // 3. Status filter
                if (filter.status() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.status()));
                }

                // 4. Provider filter
                if (filter.provider() != null && !filter.provider().isBlank()) {
                    predicates.add(cb.equal(cb.lower(root.get("provider")), filter.provider().trim().toLowerCase()));
                }

                // 5. Date range filters
                if (filter.fromDate() != null) {
                    predicates.add(cb.greaterThanOrEqualTo(root.get("createdAt"), filter.fromDate()));
                }
                if (filter.toDate() != null) {
                    predicates.add(cb.lessThanOrEqualTo(root.get("createdAt"), filter.toDate()));
                }

                // 6. Search filter
                if (filter.search() != null && !filter.search().isBlank()) {
                    String searchPattern = "%" + filter.search().trim().toLowerCase() + "%";

                    Predicate searchTx = cb.like(cb.lower(root.get("transactionId")), searchPattern);
                    Predicate searchCode = cb.like(cb.lower(root.get("order").get("gatewayOrderCode")), searchPattern);
                    Predicate searchEmail = cb.like(cb.lower(root.get("order").get("user").get("email")), searchPattern);
                    Predicate searchUsername = cb.like(cb.lower(root.get("order").get("user").get("username")), searchPattern);

                    predicates.add(cb.or(searchTx, searchCode, searchEmail, searchUsername));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
