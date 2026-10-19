package com.edore.backend.features.ai.service;

import com.edore.backend.features.lesson.entity.LessonQuestion;
import com.edore.backend.features.lesson.repository.LessonQuestionRepository;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.model.NodeTypeEnum;
import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import org.junit.jupiter.api.Test;
import java.util.*;
import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class PracticeNodeServiceTest {
    @Test void mergesBankQuestionsInTemplateOrderWithoutWarmupQuestions() {
        var repository = mock(LessonQuestionRepository.class);
        var service = new PracticeNodeService(repository);
        var warmup = NodeType.builder().id(NodeTypeEnum.KHOI_DONG).name("Khởi động").build();
        var practice = NodeType.builder().id(NodeTypeEnum.LUYEN_TAP).name("Luyện tập").build();
        var application = NodeType.builder().id(NodeTypeEnum.VAN_DUNG).name("Vận dụng").build();
        when(repository.findByLessonCodeAndStageTagOrderByIdAsc("LS6_KNTT_B01", "PRACTICE"))
                .thenReturn(List.of(LessonQuestion.builder().id("Q1").questionText("Lịch sử là gì?")
                        .option1("A").option2("B").correctAnswer(2).timeLimit(20)
                        .difficulty("EASY").explanation("Giải thích").build()));
        var first = mock(ScriptNodeResultDto.class);
        var last = mock(ScriptNodeResultDto.class);
        var result = service.merge(List.of(warmup, practice, application), List.of(first, last), "LS6_KNTT_B01");
        assertSame(first, result.get(0));
        assertSame(last, result.get(2));
        Map<?, ?> payload = (Map<?, ?>) result.get(1).nodePayload();
        Map<?, ?> question = (Map<?, ?>) ((List<?>) payload.get("exercises")).getFirst();
        assertEquals(List.of("A", "B", "", ""), question.get("options"));
        assertEquals(2, question.get("correct_answer"));
        assertEquals("B", question.get("answer"));
        assertEquals("Giải thích", question.get("explanation"));
        verify(repository).findByLessonCodeAndStageTagOrderByIdAsc("LS6_KNTT_B01", "PRACTICE");
        verifyNoMoreInteractions(repository);
    }

    @Test void missingBankKeepsAnEmptyPracticeNodeForManualEntry() {
        var repository = mock(LessonQuestionRepository.class);
        when(repository.findByLessonCodeAndStageTagOrderByIdAsc("OTHER", "PRACTICE")).thenReturn(List.of());
        var node = NodeType.builder().id(NodeTypeEnum.LUYEN_TAP).name("Luyện tập").build();
        var result = new PracticeNodeService(repository).merge(List.of(node), List.of(), "OTHER");
        assertEquals(List.of(), ((Map<?, ?>) result.getFirst().nodePayload()).get("exercises"));
    }
}
