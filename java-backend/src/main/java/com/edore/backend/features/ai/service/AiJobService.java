package com.edore.backend.features.ai.service;

import com.edore.backend.features.ai.dto.response.AiJobStatus;

public interface AiJobService {
    void createJob(AiJobStatus jobStatus);
    void updateJobStatus(AiJobStatus jobStatus);
    AiJobStatus getJobStatus(String jobId);
}
