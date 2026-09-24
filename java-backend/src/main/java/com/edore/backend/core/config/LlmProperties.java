package com.edore.backend.core.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * LLM & Embedding API configuration — mapped from application.properties prefix "llm".
 * Flexible for both self-hosted (TEI, Ollama, Local) and cloud providers (OpenAI, Beeknoee, Cohere).
 */
@ConfigurationProperties(prefix = "llm")
public record LlmProperties(
        String baseUrl,
        String apiKey,
        String model,
        String embeddingModel,
        String embeddingBaseUrl,
        String embeddingApiKey,
        int timeoutSeconds,
        int maxFileSizeKb,
        int maxTokens,
        double temperature,
        long largeFileThreshold
) {
    public int maxTokens() {
        return maxTokens > 0 ? maxTokens : 16000;
    }

    public double temperature() {
        return temperature > 0.0 ? temperature : 0.4;
    }

    public long largeFileThreshold() {
        return largeFileThreshold > 0 ? largeFileThreshold : 60_000L;
    }

    public String getValidEmbeddingModel() {
        return (embeddingModel != null && !embeddingModel.isBlank())
                ? embeddingModel
                : "jina-embeddings-v3";
    }

    public String getValidEmbeddingBaseUrl() {
        return (embeddingBaseUrl != null && !embeddingBaseUrl.isBlank())
                ? embeddingBaseUrl
                : baseUrl;
    }

    public String getValidEmbeddingApiKey() {
        if (embeddingApiKey != null && !embeddingApiKey.isBlank()) {
            return embeddingApiKey;
        }
        if (embeddingBaseUrl == null || embeddingBaseUrl.isBlank() || embeddingBaseUrl.equals(baseUrl)) {
            return apiKey;
        }
        return null;
    }
}
