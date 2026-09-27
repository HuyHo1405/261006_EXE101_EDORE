package com.edore.backend.features.ai.service.impl;

import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.ai.code.AiResponseCode;
import com.edore.backend.features.ai.dto.response.AiJobStatus;
import com.edore.backend.features.ai.service.AiJobService;
import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiJobServiceImpl implements AiJobService {

    private final StringRedisTemplate redisTemplate;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String JOB_KEY_PREFIX = "ai:job:";
    private static final Duration JOB_TTL = Duration.ofHours(2);

    @Override
    public void createJob(AiJobStatus jobStatus) {
        saveToRedis(jobStatus);
    }

    @Override
    public void updateJobStatus(AiJobStatus jobStatus) {
        saveToRedis(jobStatus);
    }

    @Override
    public AiJobStatus getJobStatus(String jobId) {
        String key = JOB_KEY_PREFIX + jobId;
        String json = redisTemplate.opsForValue().get(key);
        if (json == null) {
            throw new ApiException(AiResponseCode.JOB_NOT_FOUND);
        }
        try {
            return objectMapper.readValue(json, AiJobStatus.class);
        } catch (JsonProcessingException e) {
            log.error("[AiJobService] Failed to deserialize job status for {}", jobId, e);
            throw new ApiException(AiResponseCode.JSON_PARSE_ERROR);
        }
    }

    private void saveToRedis(AiJobStatus jobStatus) {
        try {
            String key = JOB_KEY_PREFIX + jobStatus.getJobId();
            String json = objectMapper.writeValueAsString(jobStatus);
            redisTemplate.opsForValue().set(key, json, JOB_TTL);
        } catch (JsonProcessingException e) {
            log.error("[AiJobService] Failed to serialize job status for {}", jobStatus.getJobId(), e);
        }
    }
}
