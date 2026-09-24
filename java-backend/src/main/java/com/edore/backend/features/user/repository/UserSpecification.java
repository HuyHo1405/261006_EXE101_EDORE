package com.edore.backend.features.user.repository;

import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.user.dto.request.UserFilterRequestDTO;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class UserSpecification {

    public static Specification<User> filter(UserFilterRequestDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                // 1. IsActive filter
                if (filter.isActive() != null) {
                    predicates.add(cb.equal(root.get("isActive"), filter.isActive()));
                }

                // 2. Keyword search filter
                if (filter.search() != null && !filter.search().isBlank()) {
                    String searchPattern = "%" + filter.search().trim().toLowerCase() + "%";

                    Predicate searchUsername = cb.like(cb.lower(root.get("username")), searchPattern);
                    Predicate searchEmail = cb.like(cb.lower(root.get("email")), searchPattern);
                    Predicate searchPhone = cb.like(cb.lower(root.get("phone")), searchPattern);

                    predicates.add(cb.or(searchUsername, searchEmail, searchPhone));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
