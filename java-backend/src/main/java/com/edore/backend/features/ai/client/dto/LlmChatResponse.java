package com.edore.backend.features.ai.client.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

/**
 * Parsed response from the Beeknoee LLM API (OpenAI-compatible format).
 */
@JsonIgnoreProperties(ignoreUnknown = true)
public record LlmChatResponse(
        List<Choice> choices,
        Usage usage
) {
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Choice(Message message) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Message(String role, String content) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record Usage(
            @JsonProperty("prompt_tokens")     int promptTokens,
            @JsonProperty("completion_tokens") int completionTokens,
            @JsonProperty("total_tokens")      int totalTokens
    ) {}

    /** Convenience: extract content text from choices[0] */
    public String firstContent() {
        if (choices == null || choices.isEmpty()) return null;
        Choice c = choices.get(0);
        if (c == null || c.message() == null) return null;
        return c.message().content();
    }
}
