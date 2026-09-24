package com.edore.backend.features.order.repository;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.features.order.model.OrderStatus;
import com.edore.backend.features.order.model.PaymentStatus;
import com.edore.backend.features.order.service.PaymentGatewayProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class OrderEnumRegistry {

    private final Map<String, PaymentGatewayProvider> gatewayProviders;

    public List<EnumResponseDTO> getOrderEnums() {
        List<String> activeProviders = gatewayProviders.values().stream()
                .map(PaymentGatewayProvider::getProviderName)
                .distinct()
                .sorted()
                .toList();

        return List.of(
                new EnumResponseDTO("OrderStatus", Arrays.stream(OrderStatus.values()).map(Enum::name).toList()),
                new EnumResponseDTO("PaymentStatus", Arrays.stream(PaymentStatus.values()).map(Enum::name).toList()),
                new EnumResponseDTO("PaymentProvider", activeProviders)
        );
    }
}
