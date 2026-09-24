package com.edore.backend.features.vector.dto;

public record DirectoryImportRequest(
        String directoryPath,
        String subject,
        String grade,
        String collection
) {}
