package com.edore.backend.features.order.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.order.code.OrderResponseCode;
import com.edore.backend.features.order.dto.request.PaymentWebhookRequestDTO;
import com.edore.backend.features.order.dto.response.PaymentWebhookResponseDTO;
import com.edore.backend.features.order.service.PaymentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@Slf4j
@RestController
@CrossOrigin(origins = "*")
@RequestMapping("/api/orders/payment")
@Tag(   name = "WH1. Payment Webhook APIs", 
        description = "Public payment provider webhook APIs")
@RequiredArgsConstructor
public class PaymentWebhookController {

    private final PaymentService paymentService;

    @Operation( summary = "1. Payment gateway webhook receiver")
    @PostMapping("/webhook")
    public ResponseEntity<ApiResponse<PaymentWebhookResponseDTO>> handleWebhook(
            @RequestBody PaymentWebhookRequestDTO request
    ) {
        log.info("[Webhook] Incoming payment webhook: orderCode={}", request.orderCode());
        PaymentWebhookResponseDTO result = paymentService.handleWebhook(request);
        return ResponseEntity.ok(ApiResponse.of(OrderResponseCode.WEBHOOK_PROCESSED_SUCCESS, result));
    }
}
