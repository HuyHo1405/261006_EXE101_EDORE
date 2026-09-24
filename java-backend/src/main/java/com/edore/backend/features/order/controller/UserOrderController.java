package com.edore.backend.features.order.controller;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.order.code.OrderResponseCode;
import com.edore.backend.features.order.dto.request.CreatePaymentLinkRequestDTO;
import com.edore.backend.features.order.dto.request.OrderCreateRequestDTO;
import com.edore.backend.features.order.dto.request.OrderFilterRequestDTO;
import com.edore.backend.features.order.dto.request.PaymentFilterRequestDTO;
import com.edore.backend.features.order.dto.response.CreatePaymentLinkResponseDTO;
import com.edore.backend.features.order.dto.response.OrderResponseDTO;
import com.edore.backend.features.order.dto.response.PaymentResponseDTO;
import com.edore.backend.features.order.security.OrderPermissions;
import com.edore.backend.features.order.service.OrderService;
import com.edore.backend.features.order.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api/orders")
@Tag(   name = "4. User Order APIs", 
        description = "User order management, checkout, and verification APIs")
@RequiredArgsConstructor
public class UserOrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    // ─── 1. METADATA ──────────────────────────────────────────────────────────

    @Operation( summary = "1. Get order enums metadata", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/enums")
    public ResponseEntity<ApiResponse<List<EnumResponseDTO>>> getEnums() {
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_ENUMS_SUCCESS, orderService.getEnums()));
    }

    // ─── 2. ORDER OPERATIONS ──────────────────────────────────────────────────

    @Operation( summary = "2. Create a new order", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + OrderPermissions.CREATE + "') or hasAnyRole('USER', 'ADMIN')")
    @PostMapping
    public ResponseEntity<ApiResponse<OrderResponseDTO>> createOrder(
            @CurrentUser UUID userId,
            @Valid @RequestBody OrderCreateRequestDTO request
    ) {
        OrderResponseDTO result = orderService.createOrder(userId, request);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.CREATE_ORDER_SUCCESS, result));
    }

    @Operation( summary = "3. Get user's own orders (paginated & filtered)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + OrderPermissions.READ_OWN + "') or hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/my")
    public ResponseEntity<ApiResponse<PageResponseDTO<OrderResponseDTO>>> getMyOrders(
            @CurrentUser UUID userId,
            @ParameterObject @Valid OrderFilterRequestDTO filter
    ) {
        PageResponseDTO<OrderResponseDTO> result = orderService.getMyOrders(userId, filter);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "4. Get user order by ID", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + OrderPermissions.READ_OWN + "') or hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        OrderResponseDTO result = orderService.getOrderById(userId, id);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "5. Create checkout payment link",  
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + OrderPermissions.CHECKOUT + "') or hasAnyRole('USER', 'ADMIN')")
    @PostMapping("/{orderId}/checkout")
    public ResponseEntity<ApiResponse<CreatePaymentLinkResponseDTO>> checkout(
            @CurrentUser UUID userId,
            @PathVariable UUID orderId,
            @RequestParam(required = false, defaultValue = "PAYOS") String provider
    ) {
        CreatePaymentLinkResponseDTO result = paymentService.createPaymentLink(
                userId, new CreatePaymentLinkRequestDTO(orderId, provider));
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.CREATE_PAYMENT_LINK_SUCCESS, result));
    }

    // ─── 3. PAYMENT TRANSACTION OPERATIONS ─────────────────────────────────────

    @Operation( summary = "6. Get user's own payment transactions (paginated & filtered)",
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + OrderPermissions.READ_OWN + "') or hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/payments/my")
    public ResponseEntity<ApiResponse<PageResponseDTO<PaymentResponseDTO>>> getMyPayments(
            @CurrentUser UUID userId,
            @ParameterObject @Valid PaymentFilterRequestDTO filter
    ) {
        PageResponseDTO<PaymentResponseDTO> result = paymentService.getMyPayments(userId, filter);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "7. Get user payment transaction by ID", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @PreAuthorize("hasAuthority('" + OrderPermissions.READ_OWN + "') or hasAnyRole('USER', 'ADMIN')")
    @GetMapping("/payments/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(
            @CurrentUser UUID userId,
            @PathVariable UUID id
    ) {
        PaymentResponseDTO result = paymentService.getPaymentById(userId, id);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "8. Verify payment after frontend redirect")
    @GetMapping("/payment/verify")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> verifyPayment(@RequestParam String orderCode) {
        log.info("[Verify] Frontend payment redirect: orderCode={}", orderCode);
        OrderResponseDTO result = paymentService.verifyPayment(orderCode);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.VERIFY_PAYMENT_SUCCESS, result));
    }
}
