package com.edore.backend.features.lesson.service.impl;

import com.edore.backend.features.lesson.dto.request.LessonCreateRequest;
import com.edore.backend.features.lesson.dto.response.LessonForAIResponse;
import com.edore.backend.features.lesson.dto.response.LessonMetadataResponse;
import com.edore.backend.features.lesson.entity.LessonContent;
import com.edore.backend.features.lesson.entity.LessonMetadata;
import com.edore.backend.features.lesson.repository.LessonContentRepository;
import com.edore.backend.features.lesson.repository.LessonMetadataRepository;
import com.edore.backend.features.lesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonMetadataRepository metadataRepository;
    private final LessonContentRepository contentRepository;

    @Override
    @Transactional
    public void createLesson(LessonCreateRequest request) {
        LessonMetadata metadata = LessonMetadata.builder()
                .id(request.getId())
                .code(request.getCode())
                .chapterId(request.getChapterId())
                .gradeCode(request.getGradeCode())
                .textbookCode(request.getTextbookCode())
                .subjectCode(request.getSubjectCode())
                .orderInChapter(request.getOrderInChapter())
                .title(request.getTitle())
                .learningObjectives(request.getLearningObjectives())
                .images(request.getImages())
                .version(1)
                .status("draft")
                .ocrQualityFlag("needs_review")
                .build();
        
        if (metadata.getCode() == null || metadata.getCode().isEmpty()) {
            String generatedCode = metadata.getSubjectCode() + metadata.getGradeCode().replaceAll("\\D+", "") + "_" + metadata.getTextbookCode() + "_bai" + metadata.getOrderInChapter();
            metadata.setCode(generatedCode);
        }
        metadataRepository.save(metadata);

        LessonContent content = LessonContent.builder()
                .lessonId(request.getId())
                .rawContent(request.getRawContent())
                .build();
        contentRepository.save(content);
    }

    @Override
    public LessonMetadataResponse getLessonMetadata(String lessonId) {
        LessonMetadata metadata = metadataRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson metadata not found"));

        return LessonMetadataResponse.builder()
                .id(metadata.getId())
                .code(metadata.getCode())
                .chapterId(metadata.getChapterId())
                .gradeCode(metadata.getGradeCode())
                .textbookCode(metadata.getTextbookCode())
                .subjectCode(metadata.getSubjectCode())
                .orderInChapter(metadata.getOrderInChapter())
                .title(metadata.getTitle())
                .learningObjectives(metadata.getLearningObjectives())
                .images(metadata.getImages())
                .version(metadata.getVersion())
                .status(metadata.getStatus())
                .ocrQualityFlag(metadata.getOcrQualityFlag())
                .build();
    }

    @Override
    public LessonForAIResponse getLessonForAI(String lessonId) {
        LessonContent content = contentRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson content not found"));
        LessonMetadata metadata = metadataRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson metadata not found"));

        return LessonForAIResponse.builder()
                .lessonId(lessonId)
                .rawContent(content.getRawContent())
                .images(metadata.getImages())
                .build();
    }

    @Override
    @Transactional
    public void updateOCRStatus(String lessonId, String status, String ocrFlag) {
        LessonMetadata metadata = metadataRepository.findById(lessonId)
                .orElseThrow(() -> new RuntimeException("Lesson not found"));
        metadata.setStatus(status);
        metadata.setOcrQualityFlag(ocrFlag);
        
        if (metadata.getCode() == null || metadata.getCode().isEmpty()) {
            String generatedCode = metadata.getSubjectCode() + metadata.getGradeCode().replaceAll("\\D+", "") + "_" + metadata.getTextbookCode() + "_bai" + metadata.getOrderInChapter();
            metadata.setCode(generatedCode);
        }
        metadataRepository.save(metadata);
    }
}


