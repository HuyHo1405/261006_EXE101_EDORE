package com.edore.backend.features.vector.client.impl;

import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.features.vector.client.EmbeddingClient;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.ArrayList;
import java.util.List;
import java.util.Map;

/**
 * Implementation of EmbeddingClient communicating with OpenAI-compatible /v1/embeddings API (TEI or Beeknoee).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class EmbeddingClientImpl implements EmbeddingClient {

    private final LlmProperties llmProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private static final int MAX_INPUT_CHARS = 4000;

    @Override
    public float[] embed(String text) {
        if (text == null || text.isBlank()) {
            return new float[0];
        }

        List<float[]> results = embedBatch(List.of(text));
        return results.isEmpty() ? new float[0] : results.get(0);
    }

    @Override
    @SuppressWarnings("unchecked")
    public List<float[]> embedBatch(List<String> texts) {
        if (texts == null || texts.isEmpty()) {
            return List.of();
        }

        List<String> truncated = texts.stream()
                .map(t -> t == null ? "" : (t.length() > MAX_INPUT_CHARS ? t.substring(0, MAX_INPUT_CHARS) : t))
                .toList();

        try {
            String targetBaseUrl = llmProperties.getValidEmbeddingBaseUrl();
            RestClient.Builder clientBuilder = RestClient.builder()
                    .baseUrl(targetBaseUrl)
                    .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE);

            // Add Authorization header only if embedding key is present (e.g. cloud provider)
            String embApiKey = llmProperties.getValidEmbeddingApiKey();
            if (embApiKey != null && !embApiKey.isBlank()) {
                clientBuilder.defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + embApiKey);
            }

            RestClient client = clientBuilder.build();

            Map<String, Object> body = Map.of(
                    "model", llmProperties.getValidEmbeddingModel(),
                    "input", truncated
            );

            String rawJson = client.post()
                    .uri("/v1/embeddings")
                    .body(body)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> respMap = objectMapper.readValue(rawJson, Map.class);
            List<Map<String, Object>> data = (List<Map<String, Object>>) respMap.get("data");

            if (data == null) {
                log.warn("[EmbeddingClient] No data array returned from embedding API at {}", targetBaseUrl);
                return List.of();
            }

            List<float[]> embeddings = new ArrayList<>();
            for (Map<String, Object> item : data) {
                List<Number> vecList = (List<Number>) item.get("embedding");
                if (vecList != null) {
                    float[] vec = new float[vecList.size()];
                    for (int i = 0; i < vecList.size(); i++) {
                        vec[i] = vecList.get(i).floatValue();
                    }
                    embeddings.add(vec);
                }
            }

            return embeddings;

        } catch (Exception e) {
            log.warn("[EmbeddingClient] Failed to generate embedding vector: {}", e.getMessage());
            return List.of();
        }
    }
}
