package com.edore.backend.features.ai.client.dto;

/**
 * Represents a single message in the LLM chat format (OpenAI-compatible).
 */
public record LlmMessage(String role, String content) {

    public static LlmMessage system(String content) {
        return new LlmMessage("system", content);
    }

    public static LlmMessage user(String content) {
        return new LlmMessage("user", content);
    }
}
