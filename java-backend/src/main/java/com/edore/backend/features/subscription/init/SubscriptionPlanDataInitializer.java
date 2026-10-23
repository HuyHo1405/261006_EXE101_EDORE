package com.edore.backend.features.subscription.init;

import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.core.annotation.Order;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
@Order(3)
@RequiredArgsConstructor
public class SubscriptionPlanDataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        log.info("[Initializer] Ensuring default subscription plans and features exist");

        List<SubscriptionPlan> existingPlans = subscriptionPlanRepository.findAll();

        // 1. Starter Plan
        List<String> starterFeatures = List.of(
                "Khởi tạo tối đa 3 Khóa học & Lớp học",
                "AI phân tích theo bộ dữ liệu nội bộ chuẩn hóa (không cần tải file)",
                "Biên soạn tiến trình kịch bản bài giảng cơ bản",
                "Xuất kịch bản bài học dạng văn bản",
                "Hỗ trợ kỹ thuật qua Email"
        );
        upsertPlan(existingPlans, "starter", "Gói Cơ Bản", "Công cụ đồng hành soạn giảng. Trải nghiệm kịch bản AI thế hệ mới miễn phí hàng tháng.",
                BigDecimal.ZERO, 30, 3, 5, 30, true, starterFeatures);

        // 2. Pro Plan
        List<String> proFeatures = List.of(
                "Không giới hạn số lượng Khóa học & Lớp học",
                "Khai thác toàn bộ kho dữ liệu nội bộ chuyên sâu đa môn học",
                "Dòng thời gian tương tác & chuyển bước bài giảng đầy đủ",
                "Trả bài sôi nổi: Vòng quay may mắn (Lucky Wheel)",
                "Xuất file câu hỏi trắc nghiệm, doc bài giảng & mẫu Kahoot",
                "Lưu trữ và tái sử dụng ngân hàng kịch bản không giới hạn"
        );
        upsertPlan(existingPlans, "pro", "Gói Chuyên Nghiệp", "Giải pháp toàn diện cho giáo viên chuyên nghiệp. Mở khóa toàn bộ sức mạnh AI kịch bản.",
                new BigDecimal("199000"), 30, 999, 30, 200, true, proFeatures);

        // 3. Team Plan
        List<String> teamFeatures = List.of(
                "Bao gồm toàn bộ tính năng của gói Chuyên nghiệp",
                "Quản lý tập trung cho tổ bộ môn & nhà trường (Đang phát triển)",
                "Chia sẻ kho học liệu & kịch bản giảng dạy dùng chung",
                "Phân quyền chuyên môn giữa các giáo viên",
                "Hỗ trợ đào tạo và triển khai chuyên biệt"
        );
        upsertPlan(existingPlans, "team", "Gói Đội Ngũ", "Giải pháp dành cho tổ bộ môn & nhà trường (Đang phát triển). Quản lý tập trung, chia sẻ tài nguyên bài giảng.",
                new BigDecimal("499000"), 30, 9999, 50, 500, false, teamFeatures);

        log.info("[Initializer] Subscription plans and features synced successfully.");
    }

    private void upsertPlan(List<SubscriptionPlan> existingPlans, String keyword, String name, String description,
                            BigDecimal price, int durationDays, int maxCourses, int maxScriptsPerCourse,
                            int maxStudents, boolean isActive, List<String> features) {
        List<SubscriptionPlan> matched = existingPlans.stream()
                .filter(p -> p.getName() != null && (p.getName().toLowerCase().contains(keyword.toLowerCase()) || p.getName().toLowerCase().contains(name.toLowerCase())))
                .toList();

        if (matched.isEmpty()) {
            SubscriptionPlan newPlan = SubscriptionPlan.builder()
                    .name(name)
                    .description(description)
                    .price(price)
                    .durationDays(durationDays)
                    .maxCourses(maxCourses)
                    .maxScriptsPerCourse(maxScriptsPerCourse)
                    .maxStudentsPerClass(maxStudents)
                    .isActive(isActive)
                    .features(features != null ? new ArrayList<>(features) : new ArrayList<>())
                    .build();
            subscriptionPlanRepository.save(newPlan);
        } else {
            for (SubscriptionPlan plan : matched) {
                plan.setName(name);
                plan.setDescription(description);
                plan.setPrice(price);
                plan.setDurationDays(durationDays);
                plan.setMaxCourses(maxCourses);
                plan.setMaxScriptsPerCourse(maxScriptsPerCourse);
                plan.setMaxStudentsPerClass(maxStudents);
                plan.setIsActive(isActive);

                if (plan.getFeatures() == null) {
                    plan.setFeatures(features != null ? new ArrayList<>(features) : new ArrayList<>());
                } else {
                    plan.getFeatures().clear();
                    if (features != null) {
                        plan.getFeatures().addAll(features);
                    }
                }
                subscriptionPlanRepository.save(plan);
            }
        }
    }
}
