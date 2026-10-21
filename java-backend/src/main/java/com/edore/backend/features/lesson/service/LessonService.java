package com.edore.backend.features.lesson.service;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.lesson.dto.request.LessonCreateRequest;
import com.edore.backend.features.lesson.dto.request.LessonFilterRequestDTO;
import com.edore.backend.features.lesson.dto.response.LessonForAIResponse;
import com.edore.backend.features.lesson.dto.response.LessonMetadataResponse;
import com.edore.backend.features.lesson.dto.response.LessonSummaryResponse;
import com.edore.backend.features.lesson.dto.response.CurriculumSemesterResponse;

import com.edore.backend.features.lesson.dto.response.LessonQuestionResponse;

import java.util.List;

public interface LessonService {
    void createLesson(LessonCreateRequest request);
    LessonMetadataResponse getLessonMetadata(String lessonId);
    LessonForAIResponse getLessonForAI(String lessonId);
    void updateOCRStatus(String lessonId, String status, String ocrFlag);
    PageResponseDTO<LessonSummaryResponse> searchLessons(LessonFilterRequestDTO filter);
    List<CurriculumSemesterResponse> getCurriculum(LessonFilterRequestDTO filter);
    List<LessonQuestionResponse> getLessonQuestions(String lessonId, String stageTag);
    List<LessonQuestionResponse> getChapterQuestions(String chapterId, String stageTag);
}
