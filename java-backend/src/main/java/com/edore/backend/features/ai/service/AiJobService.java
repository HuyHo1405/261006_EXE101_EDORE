package com.edore.backend.features.ai.service;

import com.edore.backend.features.ai.dto.response.AiJobStatus;

import java.util.UUID;

public interface AiJobService {
    void createJob(AiJobStatus jobStatus);
    void updateJobStatus(AiJobStatus jobStatus);
    AiJobStatus getJobStatus(String jobId);
    void deleteJob(String jobId);
    boolean tryAcquireUserSlot(UUID userId);
    void releaseUserSlot(UUID userId);
}
