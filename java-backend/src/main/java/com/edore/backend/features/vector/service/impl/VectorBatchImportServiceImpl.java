package com.edore.backend.features.vector.service.impl;

import com.edore.backend.features.ai.service.ChunkingService;
import com.edore.backend.features.ai.service.FileExtractService;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.service.VectorBatchImportService;
import com.edore.backend.features.vector.service.VectorMatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.io.FilenameUtils;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

import java.io.File;
import java.io.FileInputStream;
import java.io.InputStream;
import java.util.*;

@Slf4j
@Service
@EnableConfigurationProperties(VectorMatchProperties.class)
@RequiredArgsConstructor
public class VectorBatchImportServiceImpl implements VectorBatchImportService {

    private final FileExtractService    fileExtractService;
    private final ChunkingService       chunkingService;
    private final VectorMatchService     vectorMatchService;
    private final VectorMatchProperties vectorMatchProperties;

    @Override
    public int indexFile(File file, String subject, String grade, String collection) {
        if (file == null || !file.exists() || !file.isFile()) {
            log.warn("[VectorBatchImport] Invalid file: {}", file);
            return 0;
        }

        String targetCollection = (collection != null && !collection.isBlank())
                ? collection
                : vectorMatchProperties.collectionCurriculum();

        try {
            String fileName = file.getName();
            log.info("[VectorBatchImport] Processing file '{}' ({} bytes)", fileName, file.length());

            String rawText;
            try (InputStream is = new FileInputStream(file)) {
                rawText = fileExtractService.extractFromStream(is, fileName);
            }

            if (rawText == null || rawText.isBlank()) {
                log.warn("[VectorBatchImport] Extracted text is empty for file: {}", fileName);
                return 0;
            }

            List<String> chunks = chunkingService.chunk(rawText);
            if (chunks.isEmpty()) {
                chunks = List.of(rawText);
            }

            int indexedCount = 0;
            String baseDocId = FilenameUtils.getBaseName(fileName).replaceAll("[^a-zA-Z0-9_-]", "_");

            for (int i = 0; i < chunks.size(); i++) {
                String chunkText = chunks.get(i);
                String chunkDocId = baseDocId + "_chunk_" + (i + 1);

                Map<String, Object> metadata = new HashMap<>();
                metadata.put("sourceFile", fileName);
                metadata.put("chunkIndex", i + 1);
                metadata.put("totalChunks", chunks.size());
                if (subject != null && !subject.isBlank()) metadata.put("subject", subject);
                if (grade != null && !grade.isBlank())     metadata.put("grade", grade);

                vectorMatchService.indexDocument(chunkDocId, chunkText, metadata, targetCollection);
                indexedCount++;
            }

            log.debug("[VectorBatchImport] Successfully indexed {} chunks from file '{}' into collection '{}'",
                    indexedCount, fileName, targetCollection);

            return indexedCount;

        } catch (Exception e) {
            log.error("[VectorBatchImport] Failed to index file '{}': {}", file.getName(), e.getMessage(), e);
            return 0;
        }
    }

    @Override
    public Map<String, Object> indexDirectory(String directoryPath, String defaultSubject, String defaultGrade, String collection) {
        File dir = new File(directoryPath);
        if (!dir.exists() || !dir.isDirectory()) {
            log.warn("[VectorBatchImport] Directory not found: {}", directoryPath);
            return Map.of("status", "ERROR", "message", "Directory not found: " + directoryPath);
        }

        File[] files = dir.listFiles((d, name) -> {
            String lower = name.toLowerCase();
            return lower.endsWith(".pdf") || lower.endsWith(".docx") || lower.endsWith(".txt");
        });

        if (files == null || files.length == 0) {
            log.info("[VectorBatchImport] No matching documents (.pdf, .docx, .txt) found in {}", directoryPath);
            return Map.of("status", "SUCCESS", "filesProcessed", 0, "totalChunksIndexed", 0);
        }

        int totalChunks = 0;
        int filesSuccess = 0;
        List<String> processedFiles = new ArrayList<>();

        for (File f : files) {
            int chunks = indexFile(f, defaultSubject, defaultGrade, collection);
            if (chunks > 0) {
                filesSuccess++;
                totalChunks += chunks;
                processedFiles.add(f.getName());
            }
        }

        log.info("[VectorBatchImport] Directory import complete: {}/{} files processed, {} total chunks indexed",
                filesSuccess, files.length, totalChunks);

        Map<String, Object> result = new HashMap<>();
        result.put("status", "SUCCESS");
        result.put("filesProcessed", filesSuccess);
        result.put("totalFiles", files.length);
        result.put("totalChunksIndexed", totalChunks);
        result.put("processedFiles", processedFiles);
        return result;
    }
}
