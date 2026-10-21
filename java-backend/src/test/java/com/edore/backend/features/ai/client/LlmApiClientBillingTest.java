package com.edore.backend.features.ai.client;

import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.client.dto.LlmMessage;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.sun.net.httpserver.HttpServer;
import org.junit.jupiter.api.Test;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;
import static org.junit.jupiter.api.Assertions.*;

class LlmApiClientBillingTest {
    private static final String WARNING = "⚠️ **Số dư tài khoản API không đủ**\n\nChi phí tối thiểu ước tính cho yêu cầu này: ~360đ\n\nNạp thêm tại: https://platform.beeknoee.com/billing";

    @Test void detectsActualHttp200BillingWarningAndDoesNotRetry() throws Exception {
        check(200, completion(WARNING), null);
    }

    @Test void detectsInsufficientQuotaFromHttp429WithoutRateLimitRetries() throws Exception {
        check(429, "{\"error\":{\"code\":\"insufficient_quota\",\"message\":\"Insufficient balance\"}}", null);
    }

    @Test void detectsHttp402AndStructuredHttp200BillingErrors() throws Exception {
        check(402, "Payment required", null);
        check(200, "{\"error\":{\"code\":\"insufficient_balance\"}}", null);
    }

    @Test void doesNotMistakeLessonTextAboutBillingForProviderFailure() throws Exception {
        String lesson = "{\"nodes\":[{\"node_type\":\"Vận dụng\",\"node_payload\":{\"scenario\":\"Số dư tài khoản API không đủ\"}}]}";
        check(200, completion(lesson), lesson);
    }

    private String completion(String content) throws Exception {
        return new ObjectMapper().writeValueAsString(Map.of("choices", List.of(Map.of("message", Map.of("role", "assistant", "content", content)))));
    }

    private void check(int status, String response, String expectedContent) throws Exception {
        AtomicInteger calls = new AtomicInteger();
        var server = HttpServer.create(new InetSocketAddress("127.0.0.1", 0), 0);
        server.createContext("/v1/chat/completions", exchange -> {
            calls.incrementAndGet();
            exchange.getRequestBody().readAllBytes();
            byte[] bytes = response.getBytes(StandardCharsets.UTF_8);
            exchange.getResponseHeaders().set("Content-Type", "application/json; charset=utf-8");
            exchange.sendResponseHeaders(status, bytes.length);
            try (var output = exchange.getResponseBody()) { output.write(bytes); }
        });
        server.start();
        try {
            var properties = new LlmProperties("http://127.0.0.1:" + server.getAddress().getPort(), "test-key", "test-model",
                    null, null, null, 5, 150, 16000, 0.4, 60000);
            var client = new LlmApiClient(properties);
            var messages = List.of(LlmMessage.user("Test"));
            if (expectedContent == null) {
                ApiException error = assertThrows(ApiException.class, () -> client.chat(messages, 0.4, 16000));
                assertEquals(AiResponseCode.LLM_INSUFFICIENT_BALANCE, error.getResponseCode());
                assertTrue(error.getMessage().contains("không đủ số dư"));
            } else assertEquals(expectedContent, client.chat(messages, 0.4, 16000));
            assertEquals(1, calls.get());
        } finally { server.stop(0); }
    }
}
