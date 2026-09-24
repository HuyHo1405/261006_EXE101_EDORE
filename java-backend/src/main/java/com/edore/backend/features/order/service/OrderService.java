package com.edore.backend.features.order.service;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.order.dto.request.OrderCreateRequestDTO;
import com.edore.backend.features.order.dto.request.OrderFilterRequestDTO;
import com.edore.backend.features.order.dto.response.OrderResponseDTO;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    OrderResponseDTO createOrder(UUID userId, OrderCreateRequestDTO request);

    PageResponseDTO<OrderResponseDTO> getMyOrders(UUID userId, OrderFilterRequestDTO filter);

    OrderResponseDTO getOrderById(UUID userId, UUID orderId);

    PageResponseDTO<OrderResponseDTO> getAllOrdersForAdmin(OrderFilterRequestDTO filter);

    OrderResponseDTO getOrderByIdForAdmin(UUID orderId);

    List<EnumResponseDTO> getEnums();
}
