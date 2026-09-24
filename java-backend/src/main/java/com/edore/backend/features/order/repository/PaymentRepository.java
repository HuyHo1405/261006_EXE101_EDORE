package com.edore.backend.features.order.repository;

import com.edore.backend.features.order.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.Optional;
import java.util.UUID;

public interface PaymentRepository extends JpaRepository<Payment, UUID>, JpaSpecificationExecutor<Payment> {

    Optional<Payment> findByTransactionId(String transactionId);

    Optional<Payment> findByOrderId(UUID orderId);
}
