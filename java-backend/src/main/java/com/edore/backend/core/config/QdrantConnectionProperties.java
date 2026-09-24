package com.edore.backend.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Qdrant Vector DB connection configuration — mapped from application.properties prefix "qdrant".
 * Controls connection-level infrastructure settings and vector dimension (1024 for Jina v5-text-small).
 */
@ConfigurationProperties(prefix = "qdrant")
public record QdrantConnectionProperties(
        boolean enabled,
        String host,
        int port,
        int timeoutSeconds,
        int vectorDim
) {
    public int getValidVectorDim() {
        return vectorDim > 0 ? vectorDim : 1024;
    }
}
