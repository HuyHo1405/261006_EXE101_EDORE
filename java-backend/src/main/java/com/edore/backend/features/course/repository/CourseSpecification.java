package com.edore.backend.features.course.repository;

import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.course.dto.request.CourseFilterRequestDTO;
import com.edore.backend.features.course.entity.Course;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

public class CourseSpecification {

    public static Specification<Course> filter(CourseFilterRequestDTO filter, UUID userId) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            // 1. User filter
            if (userId != null) {
                predicates.add(cb.equal(root.get("user").get("id"), userId));
            }

            if (filter != null) {
                // 2. Status filter
                if (filter.status() != null) {
                    predicates.add(cb.equal(root.get("status"), filter.status()));
                }

                // 3. Category filter
                if (filter.categoryId() != null) {
                    Join<Course, Category> categoryJoin = root.join("categories");
                    predicates.add(cb.equal(categoryJoin.get("id"), filter.categoryId()));
                }

                // 4. Keyword search (title or description)
                if (filter.search() != null && !filter.search().isBlank()) {
                    String searchPattern = "%" + filter.search().trim().toLowerCase() + "%";
                    Predicate searchTitle = cb.like(cb.lower(root.get("title")), searchPattern);
                    Predicate searchDescription = cb.like(cb.lower(root.get("description")), searchPattern);
                    predicates.add(cb.or(searchTitle, searchDescription));
                }
            }

            if (query != null) {
                query.distinct(true);
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}

