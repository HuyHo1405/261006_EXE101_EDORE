package com.edore.backend.core.config;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestClient;

import java.time.Duration;

/**
 * Infrastructure Spring Configuration for Qdrant Vector DB HTTP Client.
 */
@Slf4j
@Configuration
@EnableConfigurationProperties(QdrantConnectionProperties.class)
@RequiredArgsConstructor
public class QdrantConfig {

    private final QdrantConnectionProperties qdrantConnectionProperties;

    @Bean
    public RestClient qdrantRestClient() {
        String baseUrl = String.format("http://%s:%d",
                qdrantConnectionProperties.host() != null ? qdrantConnectionProperties.host() : "localhost",
                qdrantConnectionProperties.port() > 0 ? qdrantConnectionProperties.port() : 6333);

        log.info("[QdrantConfig] Initializing Qdrant RestClient baseUrl={} enabled={}",
                baseUrl, qdrantConnectionProperties.enabled());

        return RestClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}
