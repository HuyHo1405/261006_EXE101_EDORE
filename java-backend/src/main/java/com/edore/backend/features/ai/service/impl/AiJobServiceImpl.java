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
    private static final String JOB_KEY_PREFIX    = "ai:job:";
    private static final String ACTIVE_KEY_PREFIX = "ai:active:";
    private static final Duration JOB_TTL         = Duration.ofHours(2);
    private static final Duration ACTIVE_TTL      = Duration.ofMinutes(10);

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

    @Override
    public void deleteJob(String jobId) {
        redisTemplate.delete(JOB_KEY_PREFIX + jobId);
        log.debug("[AiJobService] Deleted job key for jobId={}", jobId);
    }

    @Override
    public boolean tryAcquireUserSlot(java.util.UUID userId) {
        String key = ACTIVE_KEY_PREFIX + userId;
        Boolean ok = redisTemplate.opsForValue().setIfAbsent(key, "1", ACTIVE_TTL);
        return Boolean.TRUE.equals(ok);
    }

    @Override
    public void releaseUserSlot(java.util.UUID userId) {
        redisTemplate.delete(ACTIVE_KEY_PREFIX + userId);
    }
}
