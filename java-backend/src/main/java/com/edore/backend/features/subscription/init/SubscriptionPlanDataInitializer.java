package com.edore.backend.features.subscription.init;

import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionPlanDataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        // Clear and re-seed or seed if empty
        if (subscriptionPlanRepository.count() == 0) {
            log.info("[Initializer] Seeding default subscription plans for testing");

            SubscriptionPlan starter = SubscriptionPlan.builder()
                    .name("Starter")
                    .description("Công cụ đồng hành soạn giảng. Trải nghiệm kịch bản AI thế hệ mới miễn phí hàng tháng.")
                    .price(BigDecimal.ZERO)
                    .durationDays(30)
                    .maxCourses(3)
                    .maxStudentsPerClass(30)
                    .isActive(true)
                    .features(List.of(
                            "Khởi tạo tối đa 3 Khóa học & Lớp học",
                            "AI Phân tích tài liệu PDF/Word (tối đa 10 trang)",
                            "Studio Timeline biên soạn kịch bản cơ bản",
                            "Xuất kịch bản dạng Văn bản (Text)",
                            "Hỗ trợ qua Email"
                    ))
                    .build();

            SubscriptionPlan pro = SubscriptionPlan.builder()
                    .name("Pro Plan")
                    .description("Giải pháp toàn diện cho giáo viên chuyên nghiệp. Mở khóa toàn bộ sức mạnh AI kịch bản.")
                    .price(new BigDecimal("199000"))
                    .durationDays(30)
                    .maxCourses(999)
                    .maxStudentsPerClass(200)
                    .isActive(true)
                    .features(List.of(
                            "Không giới hạn Khóa học & Lớp học",
                            "AI Phân tích tài liệu & Slide giảng dạy nâng cao",
                            "Studio Timeline tương tác & nhảy bước đầy đủ",
                            "Sidebar Gợi ý Hoạt động Sư phạm cá nhân hóa",
                            "Lưu trữ ngân hàng kịch bản tái sử dụng"
                    ))
                    .build();

            SubscriptionPlan team = SubscriptionPlan.builder()
                    .name("Team Plan")
                    .description("Giải pháp dành cho tổ bộ môn & nhà trường. Quản lý tập trung, chia sẻ tài nguyên bài giảng.")
                    .price(new BigDecimal("499000"))
                    .durationDays(30)
                    .maxCourses(9999)
                    .maxStudentsPerClass(500)
                    .isActive(false) // Chưa hỗ trợ
                    .features(List.of())
                    .build();

            subscriptionPlanRepository.save(starter);
            subscriptionPlanRepository.save(pro);
            subscriptionPlanRepository.save(team);
            log.info("[Initializer] Successfully seeded Starter, Pro Plan, and Team Plan.");
        }
    }
}
