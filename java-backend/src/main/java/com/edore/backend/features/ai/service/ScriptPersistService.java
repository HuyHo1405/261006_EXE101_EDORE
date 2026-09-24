package com.edore.backend.features.ai.service;

import com.edore.backend.features.ai.dto.response.ScriptNodeResultDto;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.entity.Template;

import java.util.List;
import java.util.UUID;

/**
 * Persists the AI-generated script and its nodes into the database.
 */
public interface ScriptPersistService {
    /**
     * @param courseId    UUID of the course this script belongs to
     * @param template    resolved Template entity
     * @param nodes       ordered NodeType list (defines order_index)
     * @param nodeResults AI-generated content per node
     * @return saved Script entity
     */
    /**
     * Saves Script + all ScriptNodes and returns both in a {@link SaveScriptResult}.
     * The saved node list is needed by the async verification phase to get node IDs
     * without an extra DB round-trip.
     */
    SaveScriptResult saveScript(UUID courseId, Template template,
                                List<NodeType> nodes, List<ScriptNodeResultDto> nodeResults);
}
