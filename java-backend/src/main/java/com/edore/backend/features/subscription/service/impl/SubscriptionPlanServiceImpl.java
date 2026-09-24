package com.edore.backend.features.subscription.service.impl;

import com.edore.backend.features.subscription.dto.response.SubscriptionPlanResponseDTO;
import com.edore.backend.features.subscription.entity.SubscriptionPlan;
import com.edore.backend.features.subscription.repository.SubscriptionPlanRepository;
import com.edore.backend.features.subscription.service.SubscriptionPlanService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class SubscriptionPlanServiceImpl implements SubscriptionPlanService {

    private final SubscriptionPlanRepository subscriptionPlanRepository;

    @Override
    public List<SubscriptionPlanResponseDTO> getActivePlans() {
        return subscriptionPlanRepository.findAll().stream()
                .filter(plan -> Boolean.TRUE.equals(plan.getIsActive()))
                .map(this::toResponse)
                .toList();
    }

    private SubscriptionPlanResponseDTO toResponse(SubscriptionPlan plan) {
        return SubscriptionPlanResponseDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .durationDays(plan.getDurationDays())
                .isActive(plan.getIsActive())
                .build();
    }
}
