package com.edore.backend.features.ai.client;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.text.Normalizer;
import java.util.Locale;
import java.util.Set;

/** Some providers return billing failures as HTTP 200 chat content instead of HTTP errors. */
final class LlmProviderErrors {
    private static final ObjectMapper JSON = new ObjectMapper();
    private static final Set<String> BILLING_CODES = Set.of("insufficient_quota", "insufficient_balance", "insufficient_credits",
            "billing_hard_limit_reached", "payment_required");

    private LlmProviderErrors() {}

    static boolean insufficientBalance(String body) {
        if (body == null || body.isBlank()) return false;
        String trimmed = body.strip();
        if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
            try {
                JsonNode root = JSON.readTree(trimmed);
                // Never classify ordinary lesson text containing a billing-related phrase as an error.
                if (!root.isObject() || root.has("nodes") || root.has("questions")) return false;
                JsonNode error = root.path("error");
                return BILLING_CODES.contains(error.path("code").asText())
                        || BILLING_CODES.contains(error.path("type").asText())
                        || BILLING_CODES.contains(root.path("code").asText())
                        || billingMessage(error.isTextual() ? error.asText() : error.path("message").asText())
                        || billingMessage(root.path("message").asText());
            } catch (Exception ignored) { return false; }
        }
        return billingMessage(trimmed);
    }

    private static boolean billingMessage(String text) {
        String normalized = Normalizer.normalize(text, Normalizer.Form.NFD).replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT).replace('đ', 'd');
        return normalized.contains("so du tai khoan api khong du") || normalized.contains("insufficient balance")
                || normalized.contains("insufficient credits") || normalized.contains("insufficient_quota")
                || normalized.contains("insufficient_balance") || normalized.contains("not enough balance");
    }
}
