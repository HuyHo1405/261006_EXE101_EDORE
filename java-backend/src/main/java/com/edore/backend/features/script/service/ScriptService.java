package com.edore.backend.features.script.service;

import com.edore.backend.features.script.dto.request.UpdateScriptRequestDTO;
import com.edore.backend.features.script.dto.response.ScriptNodeResponseDTO;
import com.edore.backend.features.script.dto.response.ScriptResponseDTO;

import java.util.List;
import java.util.UUID;

public interface ScriptService {
    List<ScriptResponseDTO> getScriptsByCourse(UUID courseId, UUID userId);
    ScriptResponseDTO getScriptById(UUID scriptId, UUID userId);
    List<ScriptNodeResponseDTO> getScriptNodes(UUID scriptId, UUID userId);
    ScriptResponseDTO createScript(UUID courseId, UUID userId, String title);
    ScriptResponseDTO updateScript(UUID scriptId, UUID userId, UpdateScriptRequestDTO request);
    void deleteScript(UUID scriptId, UUID userId);
}
