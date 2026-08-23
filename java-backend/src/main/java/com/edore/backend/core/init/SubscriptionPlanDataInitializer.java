package com.edore.backend.core.init;

import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

@Slf4j
@Component
@RequiredArgsConstructor
public class SubscriptionPlanDataInitializer implements CommandLineRunner {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (subscriptionPlanRepository.count() == 0) {
            log.info("[Initializer] Seeding default subscription plans for testing");

            SubscriptionPlan basic = SubscriptionPlan.builder()
                    .name("Gói Thử Nghiệm (Basic)")
                    .description("Truy cập tính năng cơ bản trong 30 ngày")
                    .price(new BigDecimal("10000"))
                    .durationDays(30)
                    .isActive(true)
                    .build();

            SubscriptionPlan pro = SubscriptionPlan.builder()
                    .name("Gói Nâng Cao (Pro)")
                    .description("Truy cập toàn bộ tính năng cao cấp trong 90 ngày")
                    .price(new BigDecimal("30000"))
                    .durationDays(90)
                    .isActive(true)
                    .build();

            subscriptionPlanRepository.save(basic);
            subscriptionPlanRepository.save(pro);
            log.info("[Initializer] Successfully seeded 2 default subscription plans.");
        }
    }
}
