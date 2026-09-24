package com.edore.backend.features.script.service.impl;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.enums.StepRole;
import com.edore.backend.features.course.code.CourseResponseCode;

import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.script.dto.request.UpdateScriptRequestDTO;
import com.edore.backend.features.script.dto.response.ScriptNodeResponseDTO;
import com.edore.backend.features.script.dto.response.ScriptResponseDTO;
import com.edore.backend.features.script.entity.Script;
import com.edore.backend.features.script.entity.ScriptNode;
import com.edore.backend.features.script.repository.ScriptNodeRepository;
import com.edore.backend.features.script.repository.ScriptNodeVerificationRepository;
import com.edore.backend.features.script.repository.ScriptRepository;
import com.edore.backend.features.script.service.ScriptService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ScriptServiceImpl implements ScriptService {

    private final ScriptRepository scriptRepository;
    private final CourseRepository courseRepository;
    private final ScriptNodeRepository scriptNodeRepository;
    private final ScriptNodeVerificationRepository scriptNodeVerificationRepository;

    private ScriptResponseDTO toDTO(Script script) {
        Course course = script.getCourse();
        return new ScriptResponseDTO(
                script.getId(),
                course != null ? course.getId() : null,
                course != null ? course.getTitle() : null,
                script.getTitle(),
                script.getStatus() != null ? script.getStatus() : "DRAFT",
                script.getCreatedAt(),
                script.getUpdatedAt()
        );
    }

    private ScriptNodeResponseDTO toNodeDTO(ScriptNode node) {
        Activity activity = node.getActivity();
        List<String> stepTemplate = activity != null && activity.getDefaultStepTemplate() != null
                ? activity.getDefaultStepTemplate()
                : List.of();
        List<StepRole> stepRoles = activity != null && activity.getStepFieldMapping() != null
                ? activity.getStepFieldMapping()
                : List.of();
        List<String> materials = activity != null && activity.getDefaultMaterials() != null
                ? activity.getDefaultMaterials()
                : List.of();

        Map<String, Object> settings = node.getSettings() != null ? new LinkedHashMap<>(node.getSettings()) : new LinkedHashMap<>();

        if (!stepRoles.isEmpty()) {
            settings.put("activity_step_roles", stepRoles.stream().map(Enum::name).toList());
        }

        // Dynamically normalize execution_steps and step_content in settings if missing or using old "Bước N:" format
        if (!stepTemplate.isEmpty()) {
            @SuppressWarnings("unchecked")
            List<String> currentSteps = settings.get("execution_steps") instanceof List<?> list
                    ? list.stream().map(Object::toString).toList()
                    : List.of();

            if (currentSteps.isEmpty() || currentSteps.stream().anyMatch(s -> s.startsWith("Bước "))) {
                settings.put("execution_steps", stepTemplate);
                currentSteps = stepTemplate;
            }

            @SuppressWarnings("unchecked")
            List<String> currentStepContent = settings.get("step_content") instanceof List<?> list
                    ? list.stream().map(Object::toString).toList()
                    : List.of();

            if (currentStepContent.isEmpty() || currentStepContent.size() != currentSteps.size()) {
                @SuppressWarnings("unchecked")
                List<String> nodeContent = settings.get("node_content") instanceof List<?> list
                        ? list.stream().map(Object::toString).toList()
                        : List.of();

                List<String> stepContent = new ArrayList<>();
                for (int i = 0; i < currentSteps.size(); i++) {
                    if (i == 0) {
                        stepContent.add(""); // Procedural setup step (step title is self-explanatory)
                    } else if (i - 1 < nodeContent.size()) {
                        stepContent.add(nodeContent.get(i - 1)); // Core teaching step with lesson content from input file
                    } else if (!nodeContent.isEmpty()) {
                        stepContent.add(String.join("\n", nodeContent));
                    } else {
                        stepContent.add("");
                    }
                }
                settings.put("step_content", stepContent);
            }
        }

        return new ScriptNodeResponseDTO(
                node.getId(),
                node.getScript() != null ? node.getScript().getId() : null,
                node.getNodeType() != null ? node.getNodeType().getCode() : null,
                node.getNodeType() != null ? node.getNodeType().getName() : null,
                activity != null ? activity.getId() : null,
                activity != null ? activity.getTitle() : null,
                stepTemplate,
                stepRoles,
                materials,
                node.getOrderIndex(),
                node.getAppliedActivityCode(),
                node.getIsCustomActivity(),
                settings
        );
    }



    @Override
    @Transactional(readOnly = true)
    public List<ScriptResponseDTO> getScriptsByCourse(UUID courseId, UUID userId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        return scriptRepository.findByCourseIdOrderByCreatedAtDesc(courseId)
                .stream()
                .map(this::toDTO)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public ScriptResponseDTO getScriptById(UUID scriptId, UUID userId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        Course course = script.getCourse();
        if (course == null || course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        return toDTO(script);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ScriptNodeResponseDTO> getScriptNodes(UUID scriptId, UUID userId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        Course course = script.getCourse();
        if (course == null || course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        return scriptNodeRepository.findByScriptIdOrderByOrderIndexAsc(scriptId)
                .stream()
                .map(this::toNodeDTO)
                .toList();
    }

    @Override
    @Transactional
    public ScriptResponseDTO createScript(UUID courseId, UUID userId, String title) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        String scriptTitle = (title != null && !title.isBlank()) ? title : "Kịch bản mới";

        Script script = Script.builder()
                .course(course)
                .title(scriptTitle)
                .status("DRAFT")
                .build();

        Script saved = scriptRepository.save(script);
        log.info("[Script] Created scriptId={} for courseId={} by userId={}", saved.getId(), courseId, userId);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public ScriptResponseDTO updateScript(UUID scriptId, UUID userId, UpdateScriptRequestDTO request) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        Course course = script.getCourse();
        if (course == null || course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        if (request != null) {
            if (request.title() != null && !request.title().isBlank()) {
                script.setTitle(request.title().trim());
            }
            if (request.status() != null && !request.status().isBlank()) {
                script.setStatus(request.status().trim());
            }
        }

        Script saved = scriptRepository.save(script);
        log.info("[Script] Updated scriptId={} by userId={}", saved.getId(), userId);
        return toDTO(saved);
    }

    @Override
    @Transactional
    public void deleteScript(UUID scriptId, UUID userId) {
        Script script = scriptRepository.findById(scriptId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        Course course = script.getCourse();
        if (course == null || course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        scriptNodeVerificationRepository.deleteByScriptId(scriptId);
        scriptNodeRepository.deleteByScriptId(scriptId);
        scriptRepository.delete(script);
        log.info("[Script] Deleted scriptId={} by userId={}", scriptId, userId);
    }
}
