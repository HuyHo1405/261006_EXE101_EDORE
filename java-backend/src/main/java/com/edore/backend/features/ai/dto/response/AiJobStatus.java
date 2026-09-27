package com.edore.backend.features.ai.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiJobStatus {
    private String jobId;
    private String status; // PENDING, PROCESSING, COMPLETED, FAILED
    private int progress; // 0-100
    private UUID scriptId; // Populated when COMPLETED
    private String errorMessage; // Populated when FAILED
    private ScriptResultDto result; // Optional, to store the whole result if needed (might be heavy for redis but ok temporarily)
}
