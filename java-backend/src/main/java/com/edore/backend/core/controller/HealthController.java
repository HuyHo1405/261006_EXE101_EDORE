package com.edore.backend.core.controller;

import com.edore.backend.core.config.QdrantConnectionProperties;
import com.edore.backend.features.vector.service.VectorMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping
@Tag(name = "0. System Health", description = "Public health check endpoints for Docker, load balancers, and monitoring tools")
@RequiredArgsConstructor
public class HealthController {

    private final VectorMatchService vectorMatchService;
    private final QdrantConnectionProperties qdrantProperties;

    @Operation(summary = "1. Health check status (Public)", description = "Returns system uptime status and dependency connectivity overview.")
    @GetMapping({"/api/health", "/health"})
    public ResponseEntity<Map<String, Object>> getHealthStatus() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("timestamp", Instant.now().toString());

        Map<String, Object> components = new HashMap<>();
        components.put("backend", Map.of("status", "UP"));
        components.put("vectorService", Map.of(
                "enabled", qdrantProperties.enabled(),
                "available", vectorMatchService.isAvailable(),
                "host", qdrantProperties.host() != null ? qdrantProperties.host() : "localhost",
                "port", qdrantProperties.port(),
                "vectorDim", qdrantProperties.getValidVectorDim()
        ));

        response.put("components", components);
        return ResponseEntity.ok(response);
    }
}
