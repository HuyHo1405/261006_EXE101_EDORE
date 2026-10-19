package com.edore.backend.features.ai.service;

import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.lesson.entity.LessonQuestion;
import com.edore.backend.features.lesson.repository.LessonQuestionRepository;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.model.NodeTypeEnum;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PracticeNodeService {
    private final LessonQuestionRepository questions;

    public boolean isPractice(NodeType node) {
        return node.getId() == NodeTypeEnum.LUYEN_TAP;
    }

    /** Keep the original template order: persistence associates results by position. */
    public List<ScriptNodeResultDto> merge(List<NodeType> nodes, List<ScriptNodeResultDto> generated, String lessonCode) {
        Iterator<ScriptNodeResultDto> ai = generated.iterator();
        List<ScriptNodeResultDto> result = new ArrayList<>();
        for (NodeType node : nodes) {
            result.add(isPractice(node) ? build(node, lessonCode) : ai.next());
        }
        return result;
    }

    private ScriptNodeResultDto build(NodeType node, String lessonCode) {
        List<Map<String, Object>> exercises = questions
                .findByLessonCodeAndStageTagOrderByIdAsc(lessonCode, "PRACTICE")
                .stream().map(this::exercise).toList();
        String message = exercises.isEmpty()
                ? "Bài học chưa có câu hỏi luyện tập trong ngân hàng. Hãy thêm câu hỏi."
                : "Sử dụng bộ câu hỏi luyện tập từ ngân hàng của bài học.";
        return new ScriptNodeResultDto(node.getName(), "Luyện tập", message,
                List.of(), List.of(message), "Câu hỏi từ ngân hàng", null, true,
                List.of("Học sinh trả lời câu hỏi", "Giáo viên chữa bài và giải thích đáp án"),
                List.of(), List.of(), Map.of("source", "QUESTION_BANK", "lesson_code", lessonCode,
                        "exercises", exercises), 10, List.of(), null);
    }

    private Map<String, Object> exercise(LessonQuestion q) {
        List<String> options = Arrays.asList(q.getOption1(), q.getOption2(), q.getOption3(), q.getOption4())
                .stream().map(s -> s == null ? "" : s).toList();
        int correct = q.getCorrectAnswer();
        Map<String, Object> item = new LinkedHashMap<>();
        item.put("question_id", q.getId());
        item.put("question", q.getQuestionText());
        item.put("format", "Trắc nghiệm");
        item.put("options", options);
        item.put("correct_answer", correct);
        item.put("time_limit", q.getTimeLimit());
        item.put("explanation", q.getExplanation());
        item.put("answer", options.get(correct - 1));
        item.put("level", switch (Objects.toString(q.getDifficulty(), "MEDIUM")) {
            case "EASY" -> "nhan_biet";
            case "HARD" -> "van_dung_thap";
            default -> "thong_hieu";
        });
        return item;
    }
}
