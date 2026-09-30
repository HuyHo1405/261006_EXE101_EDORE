package com.edore.backend.features.subscription.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.subscription.code.SubscriptionResponseCode;
import com.edore.backend.features.subscription.dto.response.SubscriptionStatusResponseDTO;
import com.edore.backend.features.subscription.service.SubscriptionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@Tag(name = "09. Subscription APIs", description = "Subscription plan queries and quota status")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionService subscriptionService;
    private final UserRepository      userRepository;

    @Operation(
            summary = "Get my subscription status",
            description = "Returns the authenticated user's active subscription plan and current usage quotas.",
            security = @SecurityRequirement(name = "Bearer Authentication")
    )
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<SubscriptionStatusResponseDTO>> getMySubscription() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        UUID userId = userRepository.findByUsername(auth.getName())
                .map(u -> u.getId())
                .orElseThrow();

        SubscriptionStatusResponseDTO status = subscriptionService.getMySubscriptionStatus(userId);
        return ResponseEntity.ok(ApiResponse.of(SubscriptionResponseCode.GET_MY_SUBSCRIPTION_SUCCESS, status));
    }
}
