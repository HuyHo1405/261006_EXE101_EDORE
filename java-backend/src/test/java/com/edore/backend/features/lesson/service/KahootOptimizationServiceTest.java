package com.edore.backend.features.lesson.service;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.client.LlmApiClient;
import com.edore.backend.features.ai.client.dto.LlmMessage;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import java.util.List;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;

class KahootOptimizationServiceTest {
    private final LlmApiClient llm = mock(LlmApiClient.class);
    private final KahootOptimizationService service = new KahootOptimizationService(llm);
    private KahootOptimizationService.SourceQuestion source() {
        return new KahootOptimizationService.SourceQuestion("Câu hỏi gốc", List.of("A".repeat(90), "Đáp án B", "", ""), 2, 30);
    }
    private String valid() {
        return """
                {"questions":[{"index":0,"question":"AI đổi câu ngắn","options":["Lựa chọn A rút gọn","AI đổi B","AI thêm C","AI thêm D"],"correct_answer":1,"time_limit":5}]}
                """;
    }

    @Test void preservesOriginalShortFieldsAnswerKeyTimeAndBlankSlots() {
        when(llm.chat(anyList(), anyDouble(), anyInt())).thenReturn(valid());
        var source = source();
        var result = service.optimize(List.of(source)).getFirst();
        assertEquals("Câu hỏi gốc", result.question());
        assertEquals(List.of("Lựa chọn A rút gọn", "Đáp án B", "", ""), result.options());
        assertEquals(2, result.correct_answer());
        assertEquals(30, result.time_limit());
        assertEquals("A".repeat(90), source.options().getFirst());
        ArgumentCaptor<List<LlmMessage>> messages = ArgumentCaptor.forClass(List.class);
        verify(llm).chat(messages.capture(), eq(0.1), eq(3500));
        assertTrue(messages.getValue().getFirst().content().contains("120"));
        assertTrue(messages.getValue().getFirst().content().contains("75"));
    }

    @Test void skipsLlmEntirelyForQuestionsAlreadyWithinLimits() {
        var q = new KahootOptimizationService.SourceQuestion("Câu hỏi", List.of("A", "B"), 1, 20);
        assertEquals(q.options(), service.optimize(List.of(q)).getFirst().options());
        verifyNoInteractions(llm);
    }

    @Test void retriesOverlongResponseAndThenUsesValidatedSuggestion() {
        String invalid = valid().replace("Lựa chọn A rút gọn", "A".repeat(76));
        when(llm.chat(anyList(), anyDouble(), anyInt())).thenReturn(invalid, valid());
        assertTrue(service.optimize(List.of(source())).getFirst().options().getFirst().length() <= 75);
        verify(llm, times(2)).chat(anyList(), eq(0.1), eq(3500));
    }

    @Test void refusesInvalidJsonWrongIndicesMissingOptionsAndDuplicateChoices() {
        for (String raw : List.of("not JSON", valid().replace("\"index\":0", "\"index\":3"),
                "{\"questions\":[]}", valid().replace("Lựa chọn A rút gọn", "Đáp án B"),
                "{\"questions\":[{\"index\":0,\"question\":\"Q\",\"options\":[\"A\",\"B\"]}]}")) {
            reset(llm);
            when(llm.chat(anyList(), anyDouble(), anyInt())).thenReturn(raw);
            assertThrows(ApiException.class, () -> service.optimize(List.of(source())));
            verify(llm, times(2)).chat(anyList(), anyDouble(), anyInt());
        }
    }

    @Test void shortensOverlongQuestionAndMapsResponseByIndexRatherThanArrayOrder() {
        var first = new KahootOptimizationService.SourceQuestion("Q".repeat(121), List.of("A", "B"), 1, 20);
        var second = new KahootOptimizationService.SourceQuestion("Second", List.of("X".repeat(76), "Y"), 2, 60);
        when(llm.chat(anyList(), anyDouble(), anyInt())).thenReturn("""
                {"questions":[{"index":1,"question":"Second","options":["X ngắn","Y"]},
                {"index":0,"question":"Câu hỏi ngắn","options":["A","B"]}]}
                """);
        var result = service.optimize(List.of(first, second));
        assertEquals("Câu hỏi ngắn", result.get(0).question());
        assertEquals("Second", result.get(1).question());
        assertEquals("X ngắn", result.get(1).options().getFirst());
        assertEquals(2, result.get(1).correct_answer());
    }
}
