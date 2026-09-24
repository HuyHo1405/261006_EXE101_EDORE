package com.edore.backend.features.order.entity;

import com.edore.backend.features.order.model.PaymentStatus;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "payments")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", nullable = false, updatable = false)
    @EqualsAndHashCode.Include
    private UUID id;

    // OneToOne: one payment attempt per order
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    // Payment gateway used (e.g. PAYOS — kept generic for future multi-gateway support)
    @Column(name = "provider", nullable = false, length = 50)
    private String provider;

    // Transaction/order code from the gateway provider
    @Column(name = "transaction_id", unique = true, length = 255)
    private String transactionId;

    @Column(name = "amount", nullable = false, precision = 18, scale = 2)
    private BigDecimal amount;

    // PENDING | SUCCESS | FAILED | REFUNDED
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    private PaymentStatus status;

    @Column(name = "paid_at")
    private Instant paidAt;

    // Raw callback payload from provider — snapshot for debugging and reconciliation
    @Column(name = "raw_response", columnDefinition = "text")
    private String rawResponse;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
