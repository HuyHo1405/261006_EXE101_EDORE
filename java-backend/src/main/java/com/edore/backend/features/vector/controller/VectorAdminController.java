package com.edore.backend.features.vector.controller;

import com.edore.backend.core.response.ApiResponse;
import com.edore.backend.core.response.CommonResponseCode;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.dto.*;
import com.edore.backend.features.vector.service.VectorBatchImportService;
import com.edore.backend.features.vector.service.VectorMatchService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/vector")
@Tag(name = "A6. Vector Admin APIs", description = "Admin endpoint for managing and testing Qdrant vector collections")
// @PreAuthorize("hasRole('ADMIN')")
@SecurityRequirement(name = "Bearer Authentication")
@EnableConfigurationProperties(VectorMatchProperties.class)
@RequiredArgsConstructor
public class VectorAdminController {

    private final VectorMatchService       vectorMatchService;
    private final VectorBatchImportService vectorBatchImportService;
    private final VectorMatchProperties   vectorMatchProperties;

    // ── Endpoints ─────────────────────────────────────────────────────────────

    @Operation(summary = "1. Index raw text into Qdrant collection",
               description = "Embeds the text and stores it in Qdrant with subject/grade payload.")
    @PostMapping("/index")
    public ResponseEntity<ApiResponse<Void>> indexDocument(@RequestBody IndexRequest request) {
        log.info("[VectorAdminController] Indexing docId='{}' subject='{}' grade='{}' collection='{}'",
                request.docId(), request.subject(), request.grade(), request.collection());

        Map<String, Object> payload = new HashMap<>(request.metadata() != null ? request.metadata() : Map.of());
        if (request.subject() != null && !request.subject().isBlank()) payload.put("subject", request.subject());
        if (request.grade()   != null && !request.grade().isBlank())   payload.put("grade",   request.grade());

        vectorMatchService.indexDocument(request.docId(), request.text(), payload, request.collection());
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS));
    }

    @Operation(summary = "2. Index single PDF/DOCX/TXT file into Qdrant",
               description = "Extracts text from uploaded PDF/DOCX/TXT file, chunks it, and indexes into Qdrant.")
    @PostMapping(value = "/index-file", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ApiResponse<Map<String, Object>>> indexFile(
            @RequestPart("file") MultipartFile file,
            @RequestParam(value = "subject", required = false, defaultValue = "HISTORY") String subject,
            @RequestParam(value = "grade", required = false, defaultValue = "GRADE_6") String grade,
            @RequestParam(value = "collection", required = false) String collection
    ) {
        try {
            File tempFile = File.createTempFile("vector_import_", "_" + file.getOriginalFilename());
            file.transferTo(tempFile);

            int chunksIndexed = vectorBatchImportService.indexFile(tempFile, subject, grade, collection);
            tempFile.delete();

            Map<String, Object> result = Map.of(
                    "filename", file.getOriginalFilename(),
                    "chunksIndexed", chunksIndexed,
                    "subject", subject,
                    "grade", grade
            );

            return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, result));
        } catch (Exception e) {
            log.error("[VectorAdminController] Failed to index file upload: {}", e.getMessage(), e);
            return ResponseEntity.internalServerError().build();
        }
    }

    @Operation(summary = "3. Index entire local folder of PDF/DOCX files into Qdrant",
               description = "Scans a server directory and indexes all PDF/DOCX/TXT documents automatically.")
    @PostMapping("/index-folder")
    public ResponseEntity<ApiResponse<Map<String, Object>>> indexDirectory(@RequestBody DirectoryImportRequest request) {
        String dirPath = (request.directoryPath() != null && !request.directoryPath().isBlank())
                ? request.directoryPath()
                : "data";

        log.info("[VectorAdminController] Triggering directory import for path='{}' subject='{}' grade='{}'",
                dirPath, request.subject(), request.grade());

        Map<String, Object> result = vectorBatchImportService.indexDirectory(
                dirPath,
                request.subject() != null ? request.subject() : "HISTORY",
                request.grade()   != null ? request.grade()   : "GRADE_6",
                request.collection()
        );

        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, result));
    }

    @Operation(summary = "4. Recreate / Drop Qdrant Collection",
               description = "Drops the specified collection and recreates it clean with correct 1024 vector dimension.")
    @DeleteMapping("/collection/recreate")
    public ResponseEntity<ApiResponse<Void>> recreateCollection(
            @RequestParam(value = "collection", required = false) String collection
    ) {
        log.info("[VectorAdminController] Recreating (Drop & Create) collection='{}'", collection);
        vectorMatchService.recreateCollection(collection);
        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS));
    }

    @Operation(summary = "5. Test Grounding — standalone vector search without pipeline",
               description = "Embeds input text, searches Qdrant, and returns grounding level + top matches.")
    @PostMapping("/test-grounding")
    public ResponseEntity<ApiResponse<GroundingTestResult>> testGrounding(
            @RequestBody GroundingTestRequest request
    ) {
        if (request.text() == null || request.text().isBlank()) {
            return ResponseEntity.badRequest().build();
        }

        String collection = (request.collection() != null && !request.collection().isBlank())
                ? request.collection()
                : vectorMatchProperties.collectionCurriculum();
        int topK = (request.topK() != null && request.topK() > 0)
                ? request.topK()
                : vectorMatchProperties.topK();

        log.info("[VectorAdminController] testGrounding collection='{}' topK={} subject='{}' grade='{}' textLen={}",
                collection, topK, request.subject(), request.grade(), request.text().length());

        ReferenceMatchResult result = vectorMatchService.findSimilarReferences(
                request.text(), collection, topK, null
        );

        GroundingTestResult response = new GroundingTestResult(
                result.level().name(),
                result.topScore(),
                vectorMatchProperties.similarityStrongThreshold(),
                vectorMatchProperties.similarityWeakThreshold(),
                result.matches().size(),
                result.matches()
        );

        return ResponseEntity.ok(ApiResponse.of(CommonResponseCode.SUCCESS, response));
    }
}



