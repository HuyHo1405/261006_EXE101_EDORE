package com.edore.backend.features.script.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.core.security.CurrentUser;
import com.edore.backend.features.script.dto.request.CreateScriptRequestDTO;
import com.edore.backend.features.script.dto.request.UpdateScriptRequestDTO;
import com.edore.backend.features.script.dto.response.ScriptNodeResponseDTO;
import com.edore.backend.features.script.dto.response.ScriptResponseDTO;
import com.edore.backend.features.script.service.ScriptService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@Slf4j
@RestController
@RequestMapping("/api")
@Tag(name = "7. Script Management APIs", description = "Lesson script management within courses")
@SecurityRequirement(name = "Bearer Authentication")
@RequiredArgsConstructor
public class ScriptController {

    private final ScriptService scriptService;

    @Operation(summary = "Get scripts for a course")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/courses/{courseId}/scripts")
    public ResponseEntity<ApiResponse<List<ScriptResponseDTO>>> getScriptsByCourse(
            @PathVariable UUID courseId,
            @CurrentUser UUID userId) {
        List<ScriptResponseDTO> scripts = scriptService.getScriptsByCourse(courseId, userId);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, scripts));
    }

    @Operation(summary = "Get a single script by ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/scripts/{id}")
    public ResponseEntity<ApiResponse<ScriptResponseDTO>> getScript(
            @PathVariable UUID id,
            @CurrentUser UUID userId) {
        ScriptResponseDTO script = scriptService.getScriptById(id, userId);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, script));
    }

    @Operation(summary = "Get script nodes by script ID")
    @PreAuthorize("isAuthenticated()")
    @GetMapping("/scripts/{id}/nodes")
    public ResponseEntity<ApiResponse<List<ScriptNodeResponseDTO>>> getScriptNodes(
            @PathVariable UUID id,
            @CurrentUser UUID userId) {
        List<ScriptNodeResponseDTO> nodes = scriptService.getScriptNodes(id, userId);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, nodes));
    }

    @Operation(summary = "Create script in a course")
    @PreAuthorize("isAuthenticated()")
    @PostMapping("/courses/{courseId}/scripts")
    public ResponseEntity<ApiResponse<ScriptResponseDTO>> createScript(
            @PathVariable UUID courseId,
            @CurrentUser UUID userId,
            @RequestBody(required = false) CreateScriptRequestDTO request) {
        String title = request != null ? request.title() : null;
        ScriptResponseDTO script = scriptService.createScript(courseId, userId, title);
        return ResponseEntity.status(201).body(ApiResponse.of(CommonResponseCode.CREATED, script));
    }

    @Operation(summary = "Update script title or status")
    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/scripts/{id}")
    public ResponseEntity<ApiResponse<ScriptResponseDTO>> updateScript(
            @PathVariable UUID id,
            @CurrentUser UUID userId,
            @RequestBody UpdateScriptRequestDTO request) {
        ScriptResponseDTO script = scriptService.updateScript(id, userId, request);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, script));
    }

    @Operation(summary = "Delete a script")
    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/scripts/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteScript(
            @PathVariable UUID id,
            @CurrentUser UUID userId) {
        scriptService.deleteScript(id, userId);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS));
    }
}

