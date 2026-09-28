package com.edore.backend.features.subscription.init;

import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@Component
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
                "AI Phân tích tài liệu PDF/Word (tối đa 10 trang)",
                "Studio Timeline biên soạn kịch bản cơ bản",
                "Xuất kịch bản dạng Văn bản (Text)",
                "Hỗ trợ qua Email"
        );
        upsertPlan(existingPlans, "starter", "Starter", "Công cụ đồng hành soạn giảng. Trải nghiệm kịch bản AI thế hệ mới miễn phí hàng tháng.",
                BigDecimal.ZERO, 30, 3, 30, true, starterFeatures);

        // 2. Pro Plan
        List<String> proFeatures = List.of(
                "Không giới hạn Khóa học & Lớp học",
                "AI Phân tích tài liệu & Slide giảng dạy nâng cao",
                "Studio Timeline tương tác & nhảy bước đầy đủ",
                "Sidebar Gợi ý Hoạt động Sư phạm cá nhân hóa",
                "Lưu trữ ngân hàng kịch bản tái sử dụng"
        );
        upsertPlan(existingPlans, "pro", "Pro Plan", "Giải pháp toàn diện cho giáo viên chuyên nghiệp. Mở khóa toàn bộ sức mạnh AI kịch bản.",
                new BigDecimal("199000"), 30, 999, 200, true, proFeatures);

        // 3. Team Plan
        upsertPlan(existingPlans, "team", "Team Plan", "Giải pháp dành cho tổ bộ môn & nhà trường. Quản lý tập trung, chia sẻ tài nguyên bài giảng.",
                new BigDecimal("499000"), 30, 9999, 500, false, List.of());

        log.info("[Initializer] Subscription plans and features synced successfully.");
    }

    private void upsertPlan(List<SubscriptionPlan> existingPlans, String keyword, String name, String description,
                            BigDecimal price, int durationDays, int maxCourses, int maxStudents,
                            boolean isActive, List<String> features) {
        List<SubscriptionPlan> matched = existingPlans.stream()
                .filter(p -> p.getName() != null && p.getName().toLowerCase().contains(keyword.toLowerCase()))
                .toList();

        if (matched.isEmpty()) {
            SubscriptionPlan newPlan = SubscriptionPlan.builder()
                    .name(name)
                    .description(description)
                    .price(price)
                    .durationDays(durationDays)
                    .maxCourses(maxCourses)
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
