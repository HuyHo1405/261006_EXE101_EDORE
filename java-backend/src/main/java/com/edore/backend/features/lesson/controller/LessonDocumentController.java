package com.edore.backend.features.lesson.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.lesson.service.LessonDocumentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.io.IOException;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/lessons")
@RequiredArgsConstructor
public class LessonDocumentController {
    private final LessonDocumentService documents;

    @PostMapping("/export-docx/lesson")
    public ResponseEntity<ApiResponse<Map<String, String>>> exportLesson(@Valid @RequestBody LessonDocumentService.Request request) throws IOException {
        return response(documents.exportLesson(request));
    }

    @PostMapping({"/export-docx/questions", "/export-docx/questions/teacher"})
    public ResponseEntity<ApiResponse<Map<String, String>>> exportQuestions(@Valid @RequestBody LessonDocumentService.Request request) throws IOException {
        return response(documents.exportQuestions(request));
    }

    @PostMapping("/export-docx/questions/student")
    public ResponseEntity<ApiResponse<Map<String, String>>> exportStudentQuestions(@Valid @RequestBody LessonDocumentService.Request request) throws IOException {
        return response(documents.exportStudentQuestions(request));
    }

    @PostMapping("/export-docx")
    public ResponseEntity<ApiResponse<Map<String, String>>> export(@Valid @RequestBody LessonDocumentService.Request request) throws IOException {
        return response(documents.export(request));
    }

    private ResponseEntity<ApiResponse<Map<String, String>>> response(byte[] bytes) {
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS,
                Map.of("base64", Base64.getEncoder().encodeToString(bytes))));
    }
}
