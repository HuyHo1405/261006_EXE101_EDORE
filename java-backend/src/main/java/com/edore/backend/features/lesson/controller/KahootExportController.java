package com.edore.backend.features.lesson.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.lesson.service.KahootExportService;
import com.edore.backend.features.lesson.service.KahootExportService.Question;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.*;

@RestController
@RequestMapping("/api/v1/lessons/questions")
@RequiredArgsConstructor
public class KahootExportController {
    private final KahootExportService exporter;
    public record ExportRequest(@NotEmpty @Size(max = 200) List<@NotNull @Valid Question> questions) {}

    @PostMapping("/export-kahoot")
    public ResponseEntity<ApiResponse<Map<String, String>>> export(@Valid @RequestBody ExportRequest request) throws IOException {
        byte[] bytes = exporter.export(request.questions());
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS,
                Map.of("base64", Base64.getEncoder().encodeToString(bytes))));
    }
}
