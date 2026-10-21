package com.edore.backend.features.ai.service;

import com.edore.backend.core.config.LlmProperties;
import com.edore.backend.features.ai.client.LlmApiClient;
import com.edore.backend.features.ai.dto.response.*;
import com.edore.backend.features.ai.helper.*;
import com.edore.backend.features.ai.service.impl.AiPipelineServiceImpl;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.lesson.dto.response.*;
import com.edore.backend.features.lesson.service.LessonService;
import com.edore.backend.features.script.entity.*;
import com.edore.backend.features.script.repository.TemplateRepository;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.dto.*;
import com.edore.backend.features.vector.service.VectorMatchService;
import org.junit.jupiter.api.*;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.*;
import static org.mockito.Mockito.*;
import static org.mockito.ArgumentMatchers.*;
import static org.junit.jupiter.api.Assertions.*;

@ExtendWith(MockitoExtension.class)
class AiPracticePipelineTest {
    @Mock ChunkingService chunkingService;
    @Mock LlmApiClient llmApiClient;
    @Mock ScriptPersistService scriptPersistService;
    @Mock VectorMatchService vectorMatchService;
    @Mock VectorMatchProperties vectorMatchProperties;
    @Mock LlmProperties llmProperties;
    @Mock AiJobService aiJobService;
    @Mock AiPromptBuilder aiPromptBuilder;
    @Mock AiResponseParser aiResponseParser;
    @Mock TemplateRepository templateRepository;
    @Mock CourseRepository courseRepository;
    @Mock LessonService lessonService;
    @Mock PracticeNodeService practiceNodeService;
    @InjectMocks AiPipelineServiceImpl pipeline;

    @Test void synchronousGenerationExcludesPracticeFromPromptAndParser() { check(false); }
    @Test void asynchronousGenerationExcludesPracticeFromPromptAndParser() { check(true); }
    @Test void insufficientApiBalanceFailsTheJobWithoutParsingOrRetrying() { check(true, true); }

    private void check(boolean async) {
        check(async, false);
    }

    private void check(boolean async, boolean insufficientBalance) {
        var practice = NodeType.builder().id(com.edore.backend.features.script.model.NodeTypeEnum.LUYEN_TAP)
                .code("node_luyen_tap").name("Luyện tập").build();
        var core = NodeType.builder().id(com.edore.backend.features.script.model.NodeTypeEnum.HINH_THANH_KIEN_THUC)
                .code("node_hinh_thanh").name("Kiến thức").build();
        var nodes = List.of(core, practice);
        var aiNodes = List.of(core);
        var courseId = UUID.randomUUID();
        var template = mock(Template.class);
        var course = mock(Course.class);
        var config = mock(ClassConfig.class);
        when(templateRepository.findById(1L)).thenReturn(Optional.of(template));
        when(template.getNodeTypes()).thenReturn(nodes);
        when(courseRepository.findById(courseId)).thenReturn(Optional.of(course));
        when(course.getClassConfig()).thenReturn(config);
        when(lessonService.getLessonForAI("lesson")).thenReturn(LessonForAIResponse.builder().rawContent("Nội dung bài học").build());
        when(lessonService.getLessonMetadata("lesson")).thenReturn(LessonMetadataResponse.builder()
                .code("LS6_KNTT_B01").title("Lịch sử").learningObjectives("[]").orderInChapter(1).build());
        when(chunkingService.chunk(anyString())).thenReturn(List.of("Nội dung bài học"));
        when(llmProperties.largeFileThreshold()).thenReturn(10000L);
        when(practiceNodeService.isPractice(any(NodeType.class))).thenCallRealMethod();
        var generated = mock(ScriptNodeResultDto.class);
        var bank = mock(ScriptNodeResultDto.class);
        if (insufficientBalance) {
            when(llmApiClient.chat(anyList(), anyDouble(), anyInt())).thenThrow(new com.edore.backend.core.exception.ApiException(
                    com.edore.backend.features.ai.code.AiResponseCode.LLM_INSUFFICIENT_BALANCE));
        } else {
            when(llmApiClient.chat(anyList(), anyDouble(), anyInt())).thenReturn("json");
            when(aiResponseParser.parseAiResponse("json", aiNodes)).thenReturn(new AiParsedResult(Map.of(), List.of(generated)));
            when(practiceNodeService.merge(nodes, List.of(generated), "LS6_KNTT_B01")).thenReturn(List.of(generated, bank));
            var saved = mock(Script.class);
            when(saved.getId()).thenReturn(UUID.randomUUID());
            when(scriptPersistService.saveScript(eq(courseId), eq(template), eq(nodes), eq(List.of(generated, bank)), anyMap(), eq("Title")))
                    .thenReturn(new SaveScriptResult(saved, List.of()));
        }
        if (async) {
            var status = new AiJobStatus();
            when(aiJobService.getJobStatus("job")).thenReturn(status);
            when(vectorMatchService.findSimilarReferences(anyString(), nullable(String.class), anyInt(), any()))
                    .thenReturn(ReferenceMatchResult.empty());
            pipeline.generateScriptAsync("job", "lesson", 1L, courseId, "Title", "[]", false, null);
            if (insufficientBalance) {
                assertEquals("FAILED", status.getStatus());
                assertTrue(status.getErrorMessage().contains("không đủ số dư"));
                verify(llmApiClient, times(1)).chat(anyList(), anyDouble(), anyInt());
                verifyNoInteractions(aiResponseParser, scriptPersistService);
                return;
            }
            assertEquals("COMPLETED", status.getStatus(), status.getErrorMessage());
        } else {
            assertEquals(List.of(generated, bank), pipeline.generateScriptFromLesson("lesson", 1L, courseId, "Title", false).nodes());
        }
        verify(aiPromptBuilder).buildSystemPrompt(eq(aiNodes), eq(config), eq("[]"), any(GroundingLevel.class));
        verify(aiResponseParser).parseAiResponse("json", aiNodes);
        verify(practiceNodeService).merge(nodes, List.of(generated), "LS6_KNTT_B01");
    }
}
