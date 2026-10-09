package com.edore.backend.features.lesson.service;

import com.edore.backend.features.lesson.dto.request.LessonCreateRequest;
import com.edore.backend.features.lesson.dto.response.LessonForAIResponse;
import com.edore.backend.features.lesson.dto.response.LessonMetadataResponse;

public interface LessonService {
    void createLesson(LessonCreateRequest request);
    LessonMetadataResponse getLessonMetadata(String lessonId);
    LessonForAIResponse getLessonForAI(String lessonId);
    void updateOCRStatus(String lessonId, String status, String ocrFlag);
}
