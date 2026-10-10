package com.edore.backend.features.lesson.repository;

import com.edore.backend.features.lesson.dto.request.LessonFilterRequestDTO;
import com.edore.backend.features.lesson.entity.LessonMetadata;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class LessonSpecification {

    public static Specification<LessonMetadata> filter(LessonFilterRequestDTO filter) {
        return (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (filter != null) {
                // 1. Keyword search (title or code or numeric orderInChapter)
                if (filter.keyword() != null && !filter.keyword().isBlank()) {
                    String raw = filter.keyword().trim().toLowerCase();
                    String pattern = "%" + raw + "%";
                    Predicate titleMatch = cb.like(cb.lower(root.get("title")), pattern);
                    Predicate codeMatch = cb.like(cb.lower(root.get("code")), pattern);

                    // If keyword contains a number (e.g. "bài 1", "bài 08", "1")
                    String numStr = raw.replaceAll("^bài\\s*", "").trim();
                    try {
                        int num = Integer.parseInt(numStr);
                        Predicate orderMatch = cb.equal(root.get("orderInChapter"), num);
                        predicates.add(cb.or(titleMatch, codeMatch, orderMatch));
                    } catch (NumberFormatException e) {
                        predicates.add(cb.or(titleMatch, codeMatch));
                    }
                }

                // 2. Grade filter (strip 'lớp' if provided, e.g. "lớp 8" -> "8")
                if (filter.gradeCode() != null && !filter.gradeCode().isBlank()) {
                    String cleanGrade = filter.gradeCode().trim().toLowerCase().replaceAll("^lớp\\s*", "").trim();
                    predicates.add(cb.equal(cb.lower(root.get("gradeCode")), cleanGrade));
                }

                // 3. Subject filter (e.g. "LS", "TOAN")
                if (filter.subjectCode() != null && !filter.subjectCode().isBlank()) {
                    predicates.add(cb.equal(cb.lower(root.get("subjectCode")), filter.subjectCode().trim().toLowerCase()));
                }

                // 4. Textbook filter (e.g. "KNTT", "CTST", "CD")
                if (filter.textbookCode() != null && !filter.textbookCode().isBlank()) {
                    predicates.add(cb.equal(cb.lower(root.get("textbookCode")), filter.textbookCode().trim().toLowerCase()));
                }

                // 5. Chapter ID filter
                if (filter.chapterId() != null && !filter.chapterId().isBlank()) {
                    predicates.add(cb.equal(root.get("chapterId"), filter.chapterId().trim()));
                }

                // 6. Explicit order in chapter filter
                if (filter.orderInChapter() != null) {
                    predicates.add(cb.equal(root.get("orderInChapter"), filter.orderInChapter()));
                }
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}
