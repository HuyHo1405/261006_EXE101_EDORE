package com.edore.backend.features.classConfig.repository;

import com.edore.backend.features.classConfig.dto.request.ClassConfigFilterRequestDTO;
import com.edore.backend.features.classroom.entity.ClassConfig;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class ClassConfigSpecification {

    public static Specification<ClassConfig> filter(ClassConfigFilterRequestDTO filter, UUID userId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User filter
            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            if (filter != null) {
                // 2. Keyword search by name
                if (filter.search() != null && !filter.search().isBlank()) {
                    String searchPattern = "%" + filter.search().trim().toLowerCase() + "%";
                    predicates.add(cb.like(cb.lower(root.get("name")), searchPattern));
                }

                // 3. Enum filters
                if (filter.duration() != null) {
                    predicates.add(cb.equal(root.get("duration"), filter.duration()));
                }

                if (filter.classSize() != null) {
                    predicates.add(cb.equal(root.get("classSize"), filter.classSize()));
                }

                if (filter.space() != null) {
                    predicates.add(cb.equal(root.get("space"), filter.space()));
                }

                if (filter.seatingLayout() != null) {
                    predicates.add(cb.equal(root.get("seatingLayout"), filter.seatingLayout()));
                }

                if (filter.infrastructure() != null) {
                    predicates.add(cb.isTrue(
                            cb.function("array_contains", Boolean.class, root.get("infrastructure"), cb.literal(filter.infrastructure().name()))
                    ));
                }

                if (filter.studentDevices() != null) {
                    predicates.add(cb.isTrue(
                            cb.function("array_contains", Boolean.class, root.get("studentDevices"), cb.literal(filter.studentDevices().name()))
                    ));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
