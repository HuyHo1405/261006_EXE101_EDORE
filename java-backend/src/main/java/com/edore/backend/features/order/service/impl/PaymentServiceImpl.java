package com.edore.backend.features.order.service.impl;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.order.code.OrderResponseCode;
import com.edore.backend.features.order.dto.request.CreatePaymentLinkRequestDTO;
import com.edore.backend.features.order.dto.request.PaymentFilterRequestDTO;
import com.edore.backend.features.order.dto.request.PaymentWebhookRequestDTO;
import com.edore.backend.features.order.dto.response.CreatePaymentLinkResponseDTO;
import com.edore.backend.features.order.dto.response.OrderResponseDTO;
import com.edore.backend.features.order.dto.response.PaymentResponseDTO;
import com.edore.backend.features.order.dto.response.PaymentWebhookResponseDTO;
import com.edore.backend.features.order.entity.Order;
import com.edore.backend.features.order.entity.Payment;
import com.edore.backend.features.order.model.OrderStatus;
import com.edore.backend.features.order.model.PaymentStatus;
import com.edore.backend.features.order.repository.OrderRepository;
import com.edore.backend.features.order.repository.PaymentRepository;
import com.edore.backend.features.order.repository.PaymentSpecification;
import com.edore.backend.features.order.service.PaymentGatewayProvider;
import com.edore.backend.features.order.service.PaymentService;
import com.edore.backend.features.subscription.entity.Subscription;
import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.model.SubscriptionStatus;
import com.edore.backend.features.subscription.repository.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class PaymentServiceImpl implements PaymentService {

    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

    // Strategy Map: Spring automatically injects all PaymentGatewayProvider beans by bean name ("PAYOS", "VNPAY", etc.)
    private final Map<String, PaymentGatewayProvider> gatewayProviders;

    @Override
    @Transactional
    public CreatePaymentLinkResponseDTO createPaymentLink(UUID userId, CreatePaymentLinkRequestDTO request) {
        log.info("[Payment] Creating payment link: userId={}, orderId={}", userId, request.orderId());

        Order order = orderRepository.findById(request.orderId())
                .orElseThrow(() -> new ApiException(OrderResponseCode.ORDER_NOT_FOUND));

        // Verify ownership
        if (!order.getUser().getId().equals(userId)) {
            throw new ApiException(OrderResponseCode.ORDER_NOT_OWNED);
        }

        // Only PENDING orders can be paid
        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ApiException(OrderResponseCode.ORDER_NOT_PAYABLE);
        }

        // Block if already successfully paid
        paymentRepository.findByOrderId(order.getId()).ifPresent(existing -> {
            if (existing.getStatus() == PaymentStatus.SUCCESS) {
                throw new ApiException(OrderResponseCode.ORDER_ALREADY_PAID);
            }
        });

        long gatewayOrderCode = System.currentTimeMillis() % 1_000_000_000_000L;
        order.setGatewayOrderCode(gatewayOrderCode);
        orderRepository.save(order);

        String orderCode = String.valueOf(gatewayOrderCode);
        String description = "Edore " + order.getSubscriptionPlan().getName();

        // Resolve gateway provider dynamically from request (defaults to "PAYOS")
        PaymentGatewayProvider provider = getGatewayProvider(request.getEffectiveProvider());

        CreatePaymentLinkResponseDTO payosResponse =
                provider.createPaymentLink(orderCode, order.getAmount(), description);

        // Persist Payment record
        Payment payment = Payment.builder()
                .order(order)
                .provider(provider.getProviderName())
                .transactionId(orderCode)
                .amount(order.getAmount())
                .status(PaymentStatus.PENDING)
                .rawResponse(payosResponse.paymentLinkUrl())
                .build();
        paymentRepository.save(payment);

        log.info("[Payment] Payment record created for order {}, transactionId={}, provider={}",
                order.getId(), orderCode, provider.getProviderName());
        return payosResponse;
    }

    @Override
    @Transactional
    public PaymentWebhookResponseDTO handleWebhook(PaymentWebhookRequestDTO request) {
        String effectiveOrderCode = request.getEffectiveOrderCode();
        String effectiveStatus = request.getEffectiveStatus();
        BigDecimal effectiveAmount = request.getEffectiveAmount();

        log.info("[Webhook] Received payment webhook: orderCode={}, status={}", effectiveOrderCode, effectiveStatus);

        // PayOS Dashboard Webhook URL verification test ping (orderCode = "123")
        if ("123".equals(effectiveOrderCode) || "0".equals(effectiveOrderCode)) {
            log.info("[Webhook] PayOS Dashboard URL verification test ping received for orderCode={}", effectiveOrderCode);
            return PaymentWebhookResponseDTO.builder()
                    .success(true)
                    .message("PayOS Webhook URL test ping verified successfully.")
                    .build();
        }

        PaymentGatewayProvider provider = getGatewayProvider(request.getEffectiveProvider());

        // Verify webhook signature (if signature provided)
        if (request.signature() != null && !request.signature().isBlank()) {
            String rawPayload = effectiveOrderCode + "|" + effectiveAmount + "|" + effectiveStatus;
            if (!provider.verifyWebhookSignature(rawPayload, request.signature())) {
                log.warn("[Webhook] Invalid signature for orderCode={}", effectiveOrderCode);
                throw new ApiException(OrderResponseCode.INVALID_WEBHOOK_SIGNATURE);
            }
        }

        // Lookup Payment by transactionId
        Payment payment = paymentRepository.findByTransactionId(effectiveOrderCode)
                .orElseThrow(() -> {
                    log.warn("[Webhook] Payment not found for orderCode={}", effectiveOrderCode);
                    return new ApiException(OrderResponseCode.PAYMENT_NOT_FOUND);
                });

        // Idempotency check
        if (payment.getStatus() != PaymentStatus.PENDING) {
            log.info("[Webhook] Already processed: orderCode={}, currentStatus={}", effectiveOrderCode, payment.getStatus());
            return PaymentWebhookResponseDTO.builder()
                    .success(true)
                    .message("Already processed")
                    .build();
        }

        if (request.rawBody() != null) {
            payment.setRawResponse(request.rawBody());
        }

        if ("SUCCESS".equalsIgnoreCase(effectiveStatus) || "PAID".equalsIgnoreCase(effectiveStatus)) {
            payment.setStatus(PaymentStatus.SUCCESS);
            payment.setPaidAt(Instant.now());
            paymentRepository.save(payment);

            Order order = payment.getOrder();
            order.setStatus(OrderStatus.PAID);
            orderRepository.save(order);

            activateSubscription(order);

            log.info("[Webhook] Payment SUCCESS for order {}, subscription activated", order.getId());
            return PaymentWebhookResponseDTO.builder()
                    .success(true)
                    .message("Payment successful. Subscription activated.")
                    .build();

        } else if ("FAILED".equalsIgnoreCase(effectiveStatus) || "CANCELLED".equalsIgnoreCase(effectiveStatus)) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);

            log.info("[Webhook] Payment FAILED/CANCELLED for orderCode={}", effectiveOrderCode);
            return PaymentWebhookResponseDTO.builder()
                    .success(true)
                    .message("Payment failure recorded.")
                    .build();
        }

        log.warn("[Webhook] Unknown status received: {}", effectiveStatus);
        return PaymentWebhookResponseDTO.builder()
                .success(false)
                .message("Unsupported status: " + effectiveStatus)
                .build();
    }

    @Override
    @Transactional
    public OrderResponseDTO verifyPayment(String orderCode) {
        log.info("[Payment] Verifying payment for orderCode={}", orderCode);

        Payment payment = paymentRepository.findByTransactionId(orderCode)
                .orElseThrow(() -> new ApiException(OrderResponseCode.PAYMENT_NOT_FOUND));

        Order order = payment.getOrder();

        // If order is still PENDING, query live status from gateway provider (e.g. PayOS)
        if (order.getStatus() == OrderStatus.PENDING) {
            PaymentGatewayProvider provider = getGatewayProvider(payment.getProvider());
            String liveStatus = provider.getPaymentStatus(orderCode);
            if ("PAID".equalsIgnoreCase(liveStatus) || "SUCCESS".equalsIgnoreCase(liveStatus)) {
                log.info("[Payment] Live status is PAID for orderCode={}. Updating order to PAID.", orderCode);
                payment.setStatus(PaymentStatus.SUCCESS);
                payment.setPaidAt(Instant.now());
                paymentRepository.save(payment);

                order.setStatus(OrderStatus.PAID);
                orderRepository.save(order);

                activateSubscription(order);
            }
        }

        return OrderResponseDTO.builder()
                .id(order.getId())
                .userId(null)
                .subscriptionPlanId(order.getSubscriptionPlan().getId())
                .subscriptionPlanName(order.getSubscriptionPlan().getName())
                .amount(order.getAmount())
                .status(order.getStatus())
                .gatewayOrderCode(order.getGatewayOrderCode())
                .createdAt(order.getCreatedAt())
                .updatedAt(order.getUpdatedAt())
                .build();
    }

    @Override
    public PageResponseDTO<PaymentResponseDTO> getMyPayments(UUID userId, PaymentFilterRequestDTO filter) {
        Pageable pageable = createPaymentPageable(filter);
        Specification<Payment> spec = PaymentSpecification.filter(userId, filter);
        Page<PaymentResponseDTO> page = paymentRepository.findAll(spec, pageable).map(this::toPaymentResponse);
        return PageResponseDTO.of(page);
    }

    @Override
    public PaymentResponseDTO getPaymentById(UUID userId, UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException(OrderResponseCode.PAYMENT_NOT_FOUND));

        if (!payment.getOrder().getUser().getId().equals(userId)) {
            throw new ApiException(OrderResponseCode.ORDER_NOT_OWNED);
        }

        return toPaymentResponse(payment);
    }

    @Override
    public PageResponseDTO<PaymentResponseDTO> getAllPaymentsForAdmin(PaymentFilterRequestDTO filter) {
        Pageable pageable = createPaymentPageable(filter);
        Specification<Payment> spec = PaymentSpecification.filter(null, filter);
        Page<PaymentResponseDTO> page = paymentRepository.findAll(spec, pageable).map(this::toPaymentResponse);
        return PageResponseDTO.of(page);
    }

    @Override
    public PaymentResponseDTO getPaymentByIdForAdmin(UUID paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ApiException(OrderResponseCode.PAYMENT_NOT_FOUND));
        return toPaymentResponse(payment);
    }

    // ─── Private Helpers ─────────────────────────────────────────────────────

    private Pageable createPaymentPageable(PaymentFilterRequestDTO filter) {
        if (filter == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPageNumber(), filter.getPageSize(), Sort.by(direction, filter.getValidSortBy()));
    }

    private PaymentResponseDTO toPaymentResponse(Payment payment) {
        return PaymentResponseDTO.builder()
                .id(payment.getId())
                .orderId(payment.getOrder().getId())
                .userId(payment.getOrder().getUser().getId())
                .subscriptionPlanId(payment.getOrder().getSubscriptionPlan().getId())
                .subscriptionPlanName(payment.getOrder().getSubscriptionPlan().getName())
                .provider(payment.getProvider())
                .transactionId(payment.getTransactionId())
                .amount(payment.getAmount())
                .status(payment.getStatus())
                .paidAt(payment.getPaidAt())
                .createdAt(payment.getCreatedAt())
                .build();
    }

    private PaymentGatewayProvider getGatewayProvider(String name) {
        PaymentGatewayProvider provider = gatewayProviders.get(name.toUpperCase());
        if (provider == null) {
            log.warn("[Payment] Provider not supported: {}", name);
            throw new ApiException(OrderResponseCode.UNSUPPORTED_PAYMENT_PROVIDER);
        }
        return provider;
    }

    private void activateSubscription(Order order) {
        SubscriptionPlan plan = order.getSubscriptionPlan();
        Instant now = Instant.now();
        Instant endDate = now.plusSeconds((long) plan.getDurationDays() * 24 * 60 * 60);

        Subscription subscription = Subscription.builder()
                .user(order.getUser())
                .subscriptionPlan(plan)
                .status(SubscriptionStatus.ACTIVE)
                .startDate(now)
                .endDate(endDate)
                .build();

        subscriptionRepository.save(subscription);
        log.info("[Subscription] Activated subscription for user={}, plan={}, until={}",
                order.getUser().getId(), plan.getName(), endDate);
    }
}
