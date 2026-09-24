package com.edore.backend.features.subscription.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.subscription.code.SubscriptionPlanCode;
import com.edore.backend.features.subscription.dto.response.SubscriptionPlanResponseDTO;
import com.edore.backend.features.subscription.service.SubscriptionPlanService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/subscription-plans")
@Tag(   name = "3. Subscription Plan APIs", 
        description = "Public subscription plan queries")
@RequiredArgsConstructor
public class SubscriptionPlanController {

    private final SubscriptionPlanService subscriptionPlanService;
    
    @Operation(summary = "1. Get active subscription plans")
    @GetMapping
    public ResponseEntity<ApiResponse<List<SubscriptionPlanResponseDTO>>> getActivePlans() {
        List<SubscriptionPlanResponseDTO> plans = subscriptionPlanService.getActivePlans();
        return ResponseEntity.ok(ApiResponse.of(SubscriptionPlanCode.GET_ACTIVE_PLANS_SUCCESS, plans));
    }
}
