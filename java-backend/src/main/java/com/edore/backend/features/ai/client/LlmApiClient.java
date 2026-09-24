package com.edore.backend.features.ai.client;

import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.client.dto.LlmChatResponse;
import com.edore.backend.features.ai.client.dto.LlmMessage;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * HTTP client for Beeknoee LLM Platform (OpenAI-compatible API).
 *
 * Replaces the Python GeminiService — name reflects actual provider.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class LlmApiClient {

    private final LlmProperties llmProperties;
    private final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * Send a chat completion request to the LLM API.
     *
     * @param messages    List of messages (system + user)
     * @param temperature Sampling temperature (0.0 – 1.0)
     * @param maxTokens   Max tokens to generate
     * @return Raw content string returned by the model
     */
    public String chat(List<LlmMessage> messages, double temperature, int maxTokens) {
        return chat(messages, null, temperature, maxTokens);
    }

    /**
     * Send a chat completion request with optional model override.
     */
    public String chat(List<LlmMessage> messages, String modelOverride, double temperature, int maxTokens) {
        String model = (modelOverride != null && !modelOverride.isBlank())
                ? modelOverride
                : llmProperties.model();

        Map<String, Object> body = Map.of(
                "model",      model,
                "messages",   messages,
                "max_tokens", maxTokens,
                "temperature", temperature
        );

        String url = llmProperties.baseUrl() + "/v1/chat/completions";
        log.info("[LlmApiClient] POST {} model={} messages={} maxTokens={}",
                url, model, messages.size(), maxTokens);

        for (int attempt = 1; attempt <= 3; attempt++) {
            try {
                RestClient client = RestClient.builder()
                        .baseUrl(llmProperties.baseUrl())
                        .defaultHeader(HttpHeaders.AUTHORIZATION, "Bearer " + llmProperties.apiKey())
                        .defaultHeader(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                        .build();

                String rawJson = client.post()
                        .uri("/v1/chat/completions")
                        .body(body)
                        .retrieve()
                        .body(String.class);

                LlmChatResponse response = objectMapper.readValue(rawJson, LlmChatResponse.class);
                String content = response.firstContent();

                if (content == null || content.isBlank()) {
                    log.error("[LlmApiClient] API returned empty content. Raw: {}", rawJson);
                    throw new ApiException(CommonResponseCode.EXTERNAL_SERVICE_ERROR);
                }

                log.info("[LlmApiClient] Response received, content length={} chars", content.length());
                return content;

            } catch (ApiException e) {
                throw e;
            } catch (org.springframework.web.client.HttpClientErrorException | org.springframework.web.client.HttpServerErrorException e) {
                if (e.getStatusCode().value() == 429) {
                    log.warn("[LlmApiClient] HTTP 429 TOO_MANY_REQUESTS on attempt {}/3. Body: {}. Retrying in {}ms...",
                            attempt, e.getResponseBodyAsString(), attempt * 2000);
                    if (attempt == 3) {
                        throw new ApiException(CommonResponseCode.EXTERNAL_SERVICE_ERROR);
                    }
                    try {
                        Thread.sleep(attempt * 2000L);
                    } catch (InterruptedException ie) {
                        Thread.currentThread().interrupt();
                    }
                } else {
                    log.error("[LlmApiClient] HTTP {} error from Beeknoee. Body: {}", e.getStatusCode(), e.getResponseBodyAsString());
                    throw new ApiException(CommonResponseCode.EXTERNAL_SERVICE_ERROR);
                }
            } catch (Exception e) {
                log.error("[LlmApiClient] Request failed: {} — {}", e.getClass().getSimpleName(), e.getMessage());
                if (attempt == 3) {
                    throw new ApiException(CommonResponseCode.EXTERNAL_SERVICE_ERROR);
                }
                try {
                    Thread.sleep(attempt * 1000L);
                } catch (InterruptedException ie) {
                    Thread.currentThread().interrupt();
                }
            }
        }
        throw new ApiException(CommonResponseCode.EXTERNAL_SERVICE_ERROR);
    }
}
