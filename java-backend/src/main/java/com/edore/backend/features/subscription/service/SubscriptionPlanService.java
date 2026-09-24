package com.edore.backend.features.subscription.service;

import com.edore.backend.features.subscription.dto.response.SubscriptionPlanResponseDTO;

import java.util.List;

public interface SubscriptionPlanService {

    List<SubscriptionPlanResponseDTO> getActivePlans();
}
