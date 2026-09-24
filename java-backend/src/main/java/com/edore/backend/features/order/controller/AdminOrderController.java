package com.edore.backend.features.order.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.order.code.OrderResponseCode;
import com.edore.backend.features.order.dto.request.OrderFilterRequestDTO;
import com.edore.backend.features.order.dto.request.PaymentFilterRequestDTO;
import com.edore.backend.features.order.dto.response.OrderResponseDTO;
import com.edore.backend.features.order.dto.response.PaymentResponseDTO;
import com.edore.backend.features.order.service.OrderService;
import com.edore.backend.features.order.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/orders")
@Tag(   name = "A2. Admin Order APIs", 
        description = "Admin order & payment management APIs")
@PreAuthorize("hasRole('ADMIN')")
@RequiredArgsConstructor
public class AdminOrderController {

    private final OrderService orderService;
    private final PaymentService paymentService;

    @Operation( summary = "1. Get all orders (Admin - paginated & filtered)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<OrderResponseDTO>>> getAllOrders(
            @ParameterObject @Valid OrderFilterRequestDTO filter
    ) {
        PageResponseDTO<OrderResponseDTO> result = orderService.getAllOrdersForAdmin(filter);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "2. Get order by ID (Admin)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<OrderResponseDTO>> getOrderById(@PathVariable UUID id) {
        OrderResponseDTO result = orderService.getOrderByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "3. Get all payment transactions (Admin - paginated & filtered)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<PageResponseDTO<PaymentResponseDTO>>> getAllPayments(
            @ParameterObject @Valid PaymentFilterRequestDTO filter
    ) {
        PageResponseDTO<PaymentResponseDTO> result = paymentService.getAllPaymentsForAdmin(filter);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }

    @Operation( summary = "4. Get payment transaction by ID (Admin)", 
                security = @SecurityRequirement(name = "Bearer Authentication"))
    @GetMapping("/payments/{id}")
    public ResponseEntity<ApiResponse<PaymentResponseDTO>> getPaymentById(@PathVariable UUID id) {
        PaymentResponseDTO result = paymentService.getPaymentByIdForAdmin(id);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.GET_MY_ORDERS_SUCCESS, result));
    }
}
