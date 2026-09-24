package com.edore.backend.features.activity.repository;

import com.edore.backend.features.activity.dto.request.ActivityFilterRequestDTO;
import com.edore.backend.features.activity.entity.Activity;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class ActivitySpecification {

    public static Specification<Activity> filter(ActivityFilterRequestDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter == null) {
                return cb.conjunction();
            }

            // 1. NodeType filter — JOIN activity_node_types
            if (filter.nodeTypeId() != null) {
                Join<Object, Object> nodeTypesJoin = root.join("nodeTypes");
                predicates.add(cb.equal(nodeTypesJoin.get("id"), filter.nodeTypeId()));
                if (query != null) query.distinct(true);
            }

            // 2. allowedSpace — activity must contain this space value
            if (filter.allowedSpace() != null && !filter.allowedSpace().isBlank()) {
                predicates.add(cb.isTrue(
                        cb.function("array_contains", Boolean.class,
                                root.get("allowedSpace"),
                                cb.literal(filter.allowedSpace().trim()))
                ));
            }

            // 3. allowedDuration — activity must support this duration
            if (filter.allowedDuration() != null && !filter.allowedDuration().isBlank()) {
                predicates.add(cb.isTrue(
                        cb.function("array_contains", Boolean.class,
                                root.get("allowedDuration"),
                                cb.literal(filter.allowedDuration().trim()))
                ));
            }

            // 4. allowedClassSize — activity must support this class size
            if (filter.allowedClassSize() != null && !filter.allowedClassSize().isBlank()) {
                predicates.add(cb.isTrue(
                        cb.function("array_contains", Boolean.class,
                                root.get("allowedClassSize"),
                                cb.literal(filter.allowedClassSize().trim()))
                ));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
