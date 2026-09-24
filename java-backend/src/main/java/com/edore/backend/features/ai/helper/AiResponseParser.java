package com.edore.backend.features.ai.helper;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.script.entity.NodeType;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Helper component responsible for parsing, validating and sanitizing LLM JSON responses.
 */
@Slf4j
@Component
public class AiResponseParser {

    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final Pattern DIGIT_PATTERN = Pattern.compile("\\d+");

    public List<ScriptNodeResultDto> parseAiResponse(String rawContent, List<NodeType> nodes) {
        String cleaned = rawContent
                .replaceAll("(?s)```json\\s*", "")
                .replaceAll("```", "")
                .strip();

        try {
            List<Map<String, Object>> rawList = objectMapper.readValue(cleaned, new TypeReference<>() {});

            if (rawList.size() != nodes.size()) {
                log.error("[AiResponseParser] AI returned {} nodes, expected {}", rawList.size(), nodes.size());
                throw new ApiException(AiResponseCode.NODE_COUNT_MISMATCH);
            }

            List<ScriptNodeResultDto> results = new ArrayList<>();
            for (int i = 0; i < rawList.size(); i++) {
                Map<String, Object> m = rawList.get(i);
                String nodeType = nodes.get(i).getName();

                List<String> executionSteps = sanitizeMarkdownList(getStringList(m, "execution_steps"));
                List<String> interactionFlow = sanitizeMarkdownList(getStringList(m, "interaction_flow"));
                if (interactionFlow.isEmpty() && !executionSteps.isEmpty()) {
                    interactionFlow = executionSteps;
                } else if (executionSteps.isEmpty() && !interactionFlow.isEmpty()) {
                    executionSteps = interactionFlow;
                }

                Object nodePayload = sanitizePayload(m.get("node_payload"));

                results.add(new ScriptNodeResultDto(
                        nodeType,
                        sanitizeMarkdown(getString(m, "title")),
                        sanitizeMarkdown(getString(m, "node_intent")),
                        sanitizeMarkdownList(getStringList(m, "mapped_knowledge")),
                        sanitizeMarkdownList(getStringList(m, "node_content")),
                        sanitizeMarkdown(getString(m, "applied_activity")),
                        getString(m, "applied_activity_code"),
                        getBoolean(m, "is_custom_activity"),
                        executionSteps,
                        sanitizeMarkdownList(getStringList(m, "step_content")),
                        interactionFlow,
                        nodePayload,
                        getInt(m, "estimated_time_minutes"),
                        sanitizeMarkdownList(getStringList(m, "materials_needed")),
                        null  // verification — populated by Phase 2 async, null on initial generation
                ));
            }
            return results;

        } catch (ApiException e) {
            throw e;
        } catch (Exception e) {
            log.error("[AiResponseParser] JSON parse failed: {}\nRaw content: {}", e.getMessage(), cleaned);
            throw new ApiException(AiResponseCode.JSON_PARSE_ERROR);
        }
    }

    public String sanitizeMarkdown(String s) {
        if (s == null || s.isBlank()) return s;
        int count = 0;
        int idx = 0;
        while ((idx = s.indexOf("**", idx)) != -1) {
            count++;
            idx += 2;
        }
        if (count % 2 != 0) {
            s = s + "**";
        }
        return s;
    }

    public List<String> sanitizeMarkdownList(List<String> list) {
        if (list == null || list.isEmpty()) return List.of();
        return list.stream().map(this::sanitizeMarkdown).toList();
    }

    @SuppressWarnings("unchecked")
    public Object sanitizePayload(Object obj) {
        if (obj == null) return null;
        if (obj instanceof String s) {
            return sanitizeMarkdown(s);
        } else if (obj instanceof List<?> list) {
            return list.stream().map(this::sanitizePayload).toList();
        } else if (obj instanceof Map<?, ?> map) {
            Map<String, Object> result = new LinkedHashMap<>();
            for (Map.Entry<?, ?> entry : map.entrySet()) {
                if (entry.getKey() != null) {
                    result.put(entry.getKey().toString(), sanitizePayload(entry.getValue()));
                }
            }
            return result;
        }
        return obj;
    }

    @SuppressWarnings("unchecked")
    private List<String> getStringList(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val instanceof List<?> list) {
            return list.stream().map(Object::toString).toList();
        }
        return List.of();
    }

    private String getString(Map<String, Object> m, String key) {
        Object val = m.get(key);
        return val != null ? val.toString() : null;
    }

    private Boolean getBoolean(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return false;
        if (val instanceof Boolean b) return b;
        return Boolean.parseBoolean(val.toString());
    }

    private Integer getInt(Map<String, Object> m, String key) {
        Object val = m.get(key);
        if (val == null) return null;
        if (val instanceof Number n) return n.intValue();

        String strVal = val.toString().trim();
        Matcher matcher = DIGIT_PATTERN.matcher(strVal);
        if (matcher.find()) {
            try {
                return Integer.parseInt(matcher.group());
            } catch (NumberFormatException ignored) {}
        }
        return null;
    }
}
