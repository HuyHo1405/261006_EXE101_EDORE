package com.edore.backend.features.order.service;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.order.dto.request.CreatePaymentLinkRequestDTO;
import com.edore.backend.features.order.dto.request.PaymentFilterRequestDTO;
import com.edore.backend.features.order.dto.request.PaymentWebhookRequestDTO;
import com.edore.backend.features.order.dto.response.CreatePaymentLinkResponseDTO;
import com.edore.backend.features.order.dto.response.OrderResponseDTO;
import com.edore.backend.features.order.dto.response.PaymentResponseDTO;
import com.edore.backend.features.order.dto.response.PaymentWebhookResponseDTO;

import java.util.UUID;

public interface PaymentService {

    CreatePaymentLinkResponseDTO createPaymentLink(UUID userId, CreatePaymentLinkRequestDTO request);

    PaymentWebhookResponseDTO handleWebhook(PaymentWebhookRequestDTO request);

    OrderResponseDTO verifyPayment(String orderCode);

    PageResponseDTO<PaymentResponseDTO> getMyPayments(UUID userId, PaymentFilterRequestDTO filter);

    PaymentResponseDTO getPaymentById(UUID userId, UUID paymentId);

    PageResponseDTO<PaymentResponseDTO> getAllPaymentsForAdmin(PaymentFilterRequestDTO filter);

    PaymentResponseDTO getPaymentByIdForAdmin(UUID paymentId);
}
