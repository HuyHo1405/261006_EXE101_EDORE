package com.edore.backend.features.ai.service.impl;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.repository.ActivityRepository;

import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.ai.service.SaveScriptResult;
import com.edore.backend.features.ai.service.ScriptPersistService;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.entity.Script;
import com.edore.backend.features.script.entity.ScriptNode;
import com.edore.backend.features.script.entity.Template;
import com.edore.backend.features.script.repository.ScriptNodeRepository;
import com.edore.backend.features.script.repository.ScriptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScriptPersistServiceImpl implements ScriptPersistService {

    private final ScriptRepository     scriptRepository;
    private final ScriptNodeRepository scriptNodeRepository;
    private final CourseRepository     courseRepository;
    private final ActivityRepository   activityRepository;

    @Override
    @Transactional
    public SaveScriptResult saveScript(UUID courseId, Template template,
                                       List<NodeType> nodes, List<ScriptNodeResultDto> nodeResults) {
        // ── 1. Resolve Course ────────────────────────────────────────────────
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(AiResponseCode.COURSE_NOT_FOUND));

        // ── 2. Derive title from first node ───────────────────────────────────
        String title = nodeResults.isEmpty() ? "Kịch bản bài học"
                : nodeResults.stream()
                        .map(ScriptNodeResultDto::title)
                        .filter(Objects::nonNull)
                        .findFirst()
                        .orElse("Kịch bản bài học");

        // ── 3. Save Script ─────────────────────────────────────────────────────
        Script script = Script.builder()
                .course(course)
                .template(template)
                .title(title)
                .status("DRAFT")
                .build();
        script = scriptRepository.save(script);
        log.info("[Persist] Script saved: id={} title='{}'", script.getId(), title);

        // ── 4. Save ScriptNodes ────────────────────────────────────────────────
        List<ScriptNode> scriptNodes = new ArrayList<>();
        for (int i = 0; i < nodeResults.size(); i++) {
            ScriptNodeResultDto dto = nodeResults.get(i);
            NodeType nodeType = i < nodes.size() ? nodes.get(i) : null;

            Activity activity = null;
            if (dto.appliedActivityCode() != null && !dto.appliedActivityCode().isBlank()) {
                activity = activityRepository.findByCode(dto.appliedActivityCode()).orElse(null);
            }

            Map<String, Object> settings = toSettingsMap(dto);

            ScriptNode scriptNode = ScriptNode.builder()
                    .script(script)
                    .nodeType(nodeType)
                    .activity(activity)
                    .orderIndex(i)
                    .appliedActivityCode(dto.appliedActivityCode())
                    .isCustomActivity(dto.isCustomActivity())
                    .settings(settings)
                    .build();
            scriptNodes.add(scriptNode);
        }

        List<ScriptNode> savedNodes = scriptNodeRepository.saveAll(scriptNodes);
        log.info("[Persist] {} ScriptNodes saved for script {}", savedNodes.size(), script.getId());

        return new SaveScriptResult(script, savedNodes);
    }


    // ── Helpers ───────────────────────────────────────────────────────────────

    private Map<String, Object> toSettingsMap(ScriptNodeResultDto dto) {
        Map<String, Object> map = new LinkedHashMap<>();
        map.put("title",                  dto.title());
        map.put("node_intent",            dto.nodeIntent());
        map.put("mapped_knowledge",       dto.mappedKnowledge());
        map.put("node_content",           dto.nodeContent());
        map.put("applied_activity",       dto.appliedActivity());
        map.put("applied_activity_code",  dto.appliedActivityCode());
        map.put("is_custom_activity",     dto.isCustomActivity());
        map.put("execution_steps",        dto.executionSteps());
        map.put("step_content",           dto.stepContent());
        map.put("interaction_flow",       dto.interactionFlow());
        map.put("node_payload",           dto.nodePayload());
        map.put("estimated_time_minutes", dto.estimatedTimeMinutes());
        map.put("materials_needed",       dto.materialsNeeded());
        return map;
    }
}
