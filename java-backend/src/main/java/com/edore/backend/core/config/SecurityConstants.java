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
            "/health",
            "/api/auth/**",
            "/api/categories/**",
            "/api/subscription-plans/**",
            "/api/orders/payment/webhook",
            "/api/orders/payment/verify",
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
