package com.edore.backend.features.lesson.controller;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.lesson.code.LessonResponseCode;
import com.edore.backend.features.lesson.dto.request.LessonCreateRequest;
import com.edore.backend.features.lesson.dto.request.LessonFilterRequestDTO;
import com.edore.backend.features.lesson.dto.response.ImageUploadResponse;
import com.edore.backend.features.lesson.dto.response.LessonForAIResponse;
import com.edore.backend.features.lesson.dto.response.LessonMetadataResponse;
import com.edore.backend.features.lesson.dto.response.LessonSummaryResponse;
import com.edore.backend.features.lesson.service.LessonService;
import com.edore.backend.features.media.service.CloudinaryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springdoc.core.annotations.ParameterObject;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

@RestController
@RequestMapping("/api/v1/lessons")
@Tag(name = "09. Lesson APIs", description = "Endpoints for managing lessons, metadata, and lesson media")
@RequiredArgsConstructor
public class LessonController {

    private final LessonService lessonService;
    private final CloudinaryService cloudinaryService;

    @Operation(summary = "1. Ingest new lesson", description = "Creates a new lesson metadata and content entry.")
    @PostMapping("/ingest")
    public ResponseEntity<ApiResponse<Void>> createLesson(@RequestBody LessonCreateRequest request) {
        lessonService.createLesson(request);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.CREATED));
    }

    @Operation(summary = "2. Search / List lessons", description = "Tìm kiếm bài học theo từ khóa, tên bài, số bài, khối lớp, môn, bộ sách hoặc chương. Trả về thông tin tóm tắt và ID bài học để sinh kịch bản.")
    @GetMapping
    public ResponseEntity<ApiResponse<PageResponseDTO<LessonSummaryResponse>>> searchLessons(
            @ParameterObject @Valid LessonFilterRequestDTO filter) {
        return ResponseEntity.ok(ApiResponse.of(LessonResponseCode.LESSON_SUCCESS, lessonService.searchLessons(filter)));
    }

    @Operation(summary = "3. Get lesson metadata", description = "Retrieves metadata for a specific lesson by ID.")
    @GetMapping("/{id}/metadata")
    public ResponseEntity<ApiResponse<LessonMetadataResponse>> getMetadata(
            @Parameter(description = "Lesson ID (UUID)") @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, lessonService.getLessonMetadata(id)));
    }

    @Operation(summary = "4. Get lesson content for AI", description = "Retrieves raw content and images for a specific lesson to be used in AI prompt.")
    @GetMapping("/{id}/for-ai")
    public ResponseEntity<ApiResponse<LessonForAIResponse>> getForAI(
            @Parameter(description = "Lesson ID (UUID)") @PathVariable String id) {
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, lessonService.getLessonForAI(id)));
    }

    @Operation(summary = "5. Update OCR flag", description = "Updates the status and OCR quality flag of a lesson.")
    @PatchMapping("/{id}/flag")
    public ResponseEntity<ApiResponse<Void>> updateOcrFlag(
            @Parameter(description = "Lesson ID (UUID)") @PathVariable String id, 
            @Parameter(description = "New status (e.g. published, draft)") @RequestParam String status, 
            @Parameter(description = "OCR quality flag (e.g. needs_review, clean)") @RequestParam String ocrFlag) {
        lessonService.updateOCRStatus(id, status, ocrFlag);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS));
    }

    @Operation(summary = "6. Upload image for a lesson", description = "Uploads an image to Cloudinary (under edore_lessons folder by default) and returns the secure URL.")
    @PostMapping(value = "/upload-image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<ImageUploadResponse>> uploadImage(
            @Parameter(description = "Image file to upload") @RequestParam("file") MultipartFile file,
            @Parameter(description = "Cloudinary folder name") @RequestParam(value = "folder", defaultValue = "edore_lessons") String folderName) {
        try {
            String url = cloudinaryService.uploadImage(file, folderName);
            ImageUploadResponse responseDto = ImageUploadResponse.builder().url(url).build();
            return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, responseDto));
        } catch (IOException e) {
            throw new ApiException(LessonResponseCode.UPLOAD_FAILED, e.getMessage());
        }
    }
}
