package com.edore.backend.features.order.repository;

import com.edore.backend.features.order.entity.Order;
import com.edore.backend.features.order.model.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface OrderRepository extends JpaRepository<Order, UUID>, JpaSpecificationExecutor<Order> {

    List<Order> findByUserIdOrderByCreatedAtDesc(UUID userId);

    Optional<Order> findByGatewayOrderCode(Long gatewayOrderCode);

    Optional<Order> findFirstByUserIdAndStatusOrderByCreatedAtDesc(UUID userId, OrderStatus status);
}
