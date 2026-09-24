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
                category(CategoryType.SUBJECT, "MATH",        "Toán học",    "Môn Toán học phổ thông"),
                category(CategoryType.SUBJECT, "PHYSICS",     "Vật lý",      "Môn Vật lý phổ thông"),
                category(CategoryType.SUBJECT, "CHEMISTRY",   "Hóa học",     "Môn Hóa học phổ thông"),
                category(CategoryType.SUBJECT, "BIOLOGY",     "Sinh học",    "Môn Sinh học phổ thông"),
                category(CategoryType.SUBJECT, "LITERATURE",  "Ngữ văn",     "Môn Ngữ văn phổ thông"),
                category(CategoryType.SUBJECT, "ENGLISH",     "Tiếng Anh",   "Môn Tiếng Anh phổ thông"),
                category(CategoryType.SUBJECT, "HISTORY",     "Lịch sử",     "Môn Lịch sử phổ thông"),
                category(CategoryType.SUBJECT, "GEOGRAPHY",   "Địa lý",      "Môn Địa lý phổ thông"),
                category(CategoryType.SUBJECT, "INFORMATICS", "Tin học",     "Môn Tin học phổ thông"),

                // ── GRADE ────────────────────────────────────────────────
                category(CategoryType.GRADE, "GRADE_6",  "Lớp 6",  "Khối lớp 6 trung học cơ sở"),
                category(CategoryType.GRADE, "GRADE_10", "Lớp 10", "Khối lớp 10 trung học phổ thông"),
                category(CategoryType.GRADE, "GRADE_11", "Lớp 11", "Khối lớp 11 trung học phổ thông"),
                category(CategoryType.GRADE, "GRADE_12", "Lớp 12", "Khối lớp 12 trung học phổ thông"),

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
