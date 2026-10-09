package com.edore.backend.features.category.init;

import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.category.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Seeds the standard Category taxonomy at startup.
 * Runs @Order(5) — before CourseDataInitializer @Order(12).
 */
@Slf4j
@Component
@Order(5)
@RequiredArgsConstructor
public class CategoryDataInitializer implements CommandLineRunner {

    private final CategoryRepository categoryRepository;

    @Override
    @Transactional
    public void run(String... args) {
        if (categoryRepository.count() > 0) {
            log.info("[Seed] Categories already seeded, skipping.");
            return;
        }

        List<Category> categories = List.of(
                // ── SUBJECT ───────────────────────────────────────────────
                category(CategoryType.SUBJECT, "LS", "Lịch sử", "Môn Lịch sử phổ thông"),

                // ── TEXTBOOK ──────────────────────────────────────────────
                category(CategoryType.TEXTBOOK, "CTST", "Chân trời sáng tạo", "Bộ sách Chân trời sáng tạo"),
                category(CategoryType.TEXTBOOK, "CD", "Cánh diều", "Bộ sách Cánh diều"),
                category(CategoryType.TEXTBOOK, "KNTT", "Kết nối tri thức", "Bộ sách Kết nối tri thức"),

                // ── GRADE ────────────────────────────────────────────────
                category(CategoryType.GRADE, "6", "Lớp 6", "Khối lớp 6 trung học cơ sở"),
                category(CategoryType.GRADE, "7", "Lớp 7", "Khối lớp 7 trung học cơ sở"),
                category(CategoryType.GRADE, "8", "Lớp 8", "Khối lớp 8 trung học cơ sở"),
                category(CategoryType.GRADE, "9", "Lớp 9", "Khối lớp 9 trung học cơ sở"),

                // ── PURPOSE ──────────────────────────────────────────────
                category(CategoryType.PURPOSE, "EXAM_PREP",      "Ôn thi",    "Tài liệu ôn tập và luyện thi"),
                category(CategoryType.PURPOSE, "TOPIC_SPECIAL",  "Chuyên đề", "Bài giảng chuyên đề chuyên sâu"),

                // ── OTHER ────────────────────────────────────────────────
                category(CategoryType.OTHER, "GENERAL", "Chung", "Danh mục chung, không phân loại")
        );

        categoryRepository.saveAll(categories);
        log.info("[Seed] CategoryDataInitializer completed: {} categories seeded.", categories.size());
    }

    private Category category(CategoryType type, String code, String name, String description) {
        return Category.builder()
                .type(type)
                .code(code)
                .name(name)
                .description(description)
                .build();
    }
}
