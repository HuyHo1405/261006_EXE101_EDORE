package com.edore.backend.core.config;

public class SecurityConstants {
    public static final String[] PUBLIC_MATCHERS = {
            "/swagger-ui/**",
            "/swagger-ui.html",
            "/v3/api-docs/**",
            "/v3/api-docs.yaml",
            "/actuator/**",
            "/actuator/health",
            "/api/health",
            "/api/v1/health",
            "/health",
            "/api/auth/**",
            "/api/v1/auth/**",
            "/api/categories/**",
            "/api/v1/categories/**",
            "/api/subscription-plans/**",
            "/api/v1/subscription-plans/**",
            "/api/orders/payment/webhook",
            "/api/v1/orders/payment/webhook",
            "/api/orders/payment/verify",
            "/api/v1/orders/payment/verify",
            "/",
            "/home",
            "/login",
            "/register",
            "/forgot-password",
            "/reset-password",
            "/css/**",
            "/js/**",
            "/images/**",
            "/favicon.ico",
            "/error",
            "/assets/**",
            "/h2-console/**"
    };
}
