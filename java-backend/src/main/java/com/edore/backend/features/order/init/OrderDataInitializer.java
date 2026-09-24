package com.edore.backend.features.order.init;

import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.order.entity.Order;
import com.edore.backend.features.order.entity.Payment;
import com.edore.backend.features.order.model.OrderStatus;
import com.edore.backend.features.order.model.PaymentStatus;
import com.edore.backend.features.order.repository.OrderRepository;
import com.edore.backend.features.order.repository.PaymentRepository;
import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Slf4j
@Component
@org.springframework.core.annotation.Order(10) // Run after RbacDataInitializer & SubscriptionPlanDataInitializer
@RequiredArgsConstructor
public class OrderDataInitializer implements CommandLineRunner {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (orderRepository.count() == 0) {
            log.info("[Initializer] Seeding sample orders and payments for user@sba.com");

            User user = userRepository.findByEmail("user@sba.com").orElse(null);
            if (user == null) {
                log.warn("[Initializer] Default user user@sba.com not found. Skipping order seeding.");
                return;
            }

            List<SubscriptionPlan> plans = subscriptionPlanRepository.findAll();
            if (plans.isEmpty()) {
                log.warn("[Initializer] No subscription plans found. Skipping order seeding.");
                return;
            }

            SubscriptionPlan basicPlan = plans.get(0);
            SubscriptionPlan proPlan = plans.size() > 1 ? plans.get(1) : plans.get(0);

            Instant now = Instant.now();

            // ─── Order 1: SUCCESS / PAID Order for Basic Plan ───
            Order order1 = Order.builder()
                    .user(user)
                    .subscriptionPlan(basicPlan)
                    .amount(basicPlan.getPrice())
                    .status(OrderStatus.PAID)
                    .gatewayOrderCode(100000000001L)
                    .build();
            order1 = orderRepository.save(order1);

            Payment payment1 = Payment.builder()
                    .order(order1)
                    .provider("PAYOS")
                    .transactionId("100000000001")
                    .amount(basicPlan.getPrice())
                    .status(PaymentStatus.SUCCESS)
                    .paidAt(now.minus(2, ChronoUnit.DAYS))
                    .build();
            paymentRepository.save(payment1);

            // ─── Order 2: PENDING Order for Pro Plan ───
            Order order2 = Order.builder()
                    .user(user)
                    .subscriptionPlan(proPlan)
                    .amount(proPlan.getPrice())
                    .status(OrderStatus.PENDING)
                    .gatewayOrderCode(100000000002L)
                    .build();
            order2 = orderRepository.save(order2);

            Payment payment2 = Payment.builder()
                    .order(order2)
                    .provider("PAYOS")
                    .transactionId("100000000002")
                    .amount(proPlan.getPrice())
                    .status(PaymentStatus.PENDING)
                    .build();
            paymentRepository.save(payment2);

            // ─── Order 3: FAILED Order for Basic Plan ───
            Order order3 = Order.builder()
                    .user(user)
                    .subscriptionPlan(basicPlan)
                    .amount(basicPlan.getPrice())
                    .status(OrderStatus.FAILED)
                    .gatewayOrderCode(100000000003L)
                    .build();
            order3 = orderRepository.save(order3);

            Payment payment3 = Payment.builder()
                    .order(order3)
                    .provider("PAYOS")
                    .transactionId("100000000003")
                    .amount(basicPlan.getPrice())
                    .status(PaymentStatus.FAILED)
                    .build();
            paymentRepository.save(payment3);

            log.info("[Initializer] Successfully seeded 3 sample orders and payments for user@sba.com.");
        }
    }
}
