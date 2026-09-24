package com.edore.backend.features.ai.service;

import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.InputStream;

/**
 * Extracts raw text from uploaded files or streams (PDF, DOCX, TXT, MD).
 */
public interface FileExtractService {
    /**
     * @param file uploaded file (must be pdf/docx/txt/md, ≤ configured max size)
     * @return extracted plain text
     */
    String extract(MultipartFile file);

    /**
     * Extract text directly from an InputStream and filename.
     */
    String extractFromStream(InputStream inputStream, String fileName);

    /**
     * Extract text directly from a File object.
     */
    String extractFromFile(File file);
}
