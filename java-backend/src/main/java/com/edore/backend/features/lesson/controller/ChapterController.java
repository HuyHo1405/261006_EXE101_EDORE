package com.edore.backend.features.lesson.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.features.lesson.code.LessonResponseCode;
import com.edore.backend.features.lesson.dto.request.ChapterCreateRequest;
import com.edore.backend.features.lesson.dto.response.ChapterResponse;
import com.edore.backend.features.lesson.service.ChapterService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/chapters")
@Tag(name = "03. Chapters", description = "Manage chapters")
@RequiredArgsConstructor
public class ChapterController {

    private final ChapterService chapterService;

    @Operation(summary = "1. Create new chapter")
    @PostMapping
    public ResponseEntity<ApiResponse<ChapterResponse>> createChapter(@RequestBody ChapterCreateRequest request) {
        ChapterResponse response = chapterService.createChapter(request);
        return ResponseEntity.ok(ApiResponse.of(LessonResponseCode.CHAPTER_SUCCESS, response));
    }

    @Operation(summary = "2. Get all chapters")
    @GetMapping
    public ResponseEntity<ApiResponse<List<ChapterResponse>>> getAllChapters() {
        
        List<ChapterResponse> responses = chapterService.getAllChapters();
        return ResponseEntity.ok(ApiResponse.of(LessonResponseCode.CHAPTER_SUCCESS, responses));
    }

    @Operation(summary = "3. Get chapter by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChapterResponse>> getChapterById(@PathVariable String id) {
        ChapterResponse response = chapterService.getChapterById(id);
        return ResponseEntity.ok(ApiResponse.of(LessonResponseCode.CHAPTER_SUCCESS, response));
    }
}
