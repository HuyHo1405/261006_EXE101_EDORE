package com.edore.backend.features.vector.service;

import java.io.File;
import java.util.Map;

/**
 * Service for batch importing PDF/DOCX/TXT files into Qdrant vector database.
 */
public interface VectorBatchImportService {

    /**
     * Index a single file into Qdrant after extracting and chunking text.
     */
    int indexFile(File file, String subject, String grade, String collection);

    /**
     * Scan a directory and index all supported documents into Qdrant.
     */
    Map<String, Object> indexDirectory(String directoryPath, String defaultSubject, String defaultGrade, String collection);
}
