package com.edore.backend.features.order.service.impl;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.order.code.OrderResponseCode;
import com.edore.backend.features.order.dto.request.OrderCreateRequestDTO;
import com.edore.backend.features.order.dto.request.OrderFilterRequestDTO;
import com.edore.backend.features.order.dto.response.OrderResponseDTO;
import com.edore.backend.features.order.entity.Order;
import com.edore.backend.features.order.model.OrderStatus;
import com.edore.backend.features.order.repository.OrderEnumRegistry;
import com.edore.backend.features.order.repository.OrderRepository;
import com.edore.backend.features.order.repository.OrderSpecification;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.model.SubscriptionStatus;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import com.edore.backend.features.subscription.repository.SubscriptionRepository;
import com.edore.backend.features.order.service.OrderService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.concurrent.TimeUnit;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final SubscriptionPlanRepository subscriptionPlanRepository;
    private final SubscriptionRepository subscriptionRepository;
    private final OrderEnumRegistry orderEnumRegistry;
    private final StringRedisTemplate redisTemplate;

    @Override
    @Transactional
    public OrderResponseDTO createOrder(UUID userId, OrderCreateRequestDTO request) {
        // ─── 1. Redis Distributed Lock (SETNX) — Chống Double-Click / Race Condition ───
        String lockKey = "lock:order:create:" + userId;
        Boolean acquired = redisTemplate.opsForValue().setIfAbsent(lockKey, "LOCKED", 10, TimeUnit.SECONDS);
        if (!Boolean.TRUE.equals(acquired)) {
            log.warn("[Order] Concurrent order creation attempt by user {}", userId);
            throw new ApiException(OrderResponseCode.CONCURRENT_ORDER_CREATION);
        }

        try {
            // ─── 2. Chặn Mua Trùng — Check xem user có Subscription ACTIVE còn hạn không ───
            boolean hasActiveSub = subscriptionRepository.existsByUserIdAndStatusAndEndDateAfter(
                    userId, SubscriptionStatus.ACTIVE, Instant.now());
            if (hasActiveSub) {
                log.warn("[Order] User {} already has an ACTIVE subscription", userId);
                throw new ApiException(OrderResponseCode.ACTIVE_SUBSCRIPTION_EXISTS);
            }

            // ─── 3. Chặn Spam / Reuse Đơn PENDING ─────────────────────────────────────
            Optional<Order> pendingOpt = orderRepository.findFirstByUserIdAndStatusOrderByCreatedAtDesc(userId, OrderStatus.PENDING);
            if (pendingOpt.isPresent()) {
                Order pendingOrder = pendingOpt.get();
                if (pendingOrder.getSubscriptionPlan().getId().equals(request.subscriptionPlanId())) {
                    log.info("[Order] User {} already has PENDING order {} for plan {}. Reusing existing order.",
                            userId, pendingOrder.getId(), request.subscriptionPlanId());
                    return toResponse(pendingOrder);
                } else {
                    log.warn("[Order] User {} has a PENDING order {} for another plan", userId, pendingOrder.getId());
                    throw new ApiException(OrderResponseCode.PENDING_ORDER_EXISTS);
                }
            }

            // ─── 4. Validation & Tạo đơn mới ───────────────────────────────────────────
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new ApiException(OrderResponseCode.USER_NOT_FOUND));

            SubscriptionPlan plan = subscriptionPlanRepository.findById(request.subscriptionPlanId())
                    .orElseThrow(() -> new ApiException(OrderResponseCode.SUBSCRIPTION_PLAN_NOT_FOUND));

            if (!Boolean.TRUE.equals(plan.getIsActive())) {
                throw new ApiException(OrderResponseCode.SUBSCRIPTION_PLAN_INACTIVE);
            }

            Order order = Order.builder()
                    .user(user)
                    .subscriptionPlan(plan)
                    .amount(plan.getPrice())
                    .status(OrderStatus.PENDING)
                    .build();

            Order saved = orderRepository.save(order);
            log.info("[Order] Created order {} for user {} → plan {}", saved.getId(), userId, plan.getId());

            return toResponse(saved);
        } finally {
            redisTemplate.delete(lockKey);
        }
    }

    @Override
    public PageResponseDTO<OrderResponseDTO> getMyOrders(UUID userId, OrderFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<Order> spec = OrderSpecification.filter(userId, filter);
        Page<OrderResponseDTO> page = orderRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponseDTO.of(page);
    }

    @Override
    public OrderResponseDTO getOrderById(UUID userId, UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(OrderResponseCode.ORDER_NOT_FOUND));

        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(OrderResponseCode.ORDER_NOT_OWNED);
        }

        return toResponse(order);
    }

    @Override
    public PageResponseDTO<OrderResponseDTO> getAllOrdersForAdmin(OrderFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<Order> spec = OrderSpecification.filter(null, filter);
        Page<OrderResponseDTO> page = orderRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponseDTO.of(page);
    }

    @Override
    public OrderResponseDTO getOrderByIdForAdmin(UUID orderId) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ApiException(OrderResponseCode.ORDER_NOT_FOUND));
        return toResponse(order);
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return orderEnumRegistry.getOrderEnums();
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Pageable createPageable(OrderFilterRequestDTO filter) {
        if (filter == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPageNumber(), filter.getPageSize(), Sort.by(direction, filter.getValidSortBy()));
    }

    private OrderResponseDTO toResponse(Order order) {
        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(order.getUser().getId())
                .subscriptionPlanId(order.getSubscriptionPlan().getId())
                .subscriptionPlanName(order.getSubscriptionPlan().getName())
                .amount(order.getAmount())
                .status(order.getStatus())
                .gatewayOrderCode(order.getGatewayOrderCode())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }
}
