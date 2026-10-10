package com.edore.backend.features.lesson.service.impl;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.lesson.dto.request.LessonCreateRequest;
import com.edore.backend.features.lesson.dto.request.LessonFilterRequestDTO;
import com.edore.backend.features.lesson.dto.response.LessonForAIResponse;
import com.edore.backend.features.lesson.dto.response.LessonMetadataResponse;
import com.edore.backend.features.lesson.dto.response.LessonSummaryResponse;
import com.edore.backend.features.lesson.entity.Chapter;
import com.edore.backend.features.lesson.entity.LessonContent;
import com.edore.backend.features.lesson.entity.LessonMetadata;
import com.edore.backend.features.lesson.repository.ChapterRepository;
import com.edore.backend.features.lesson.repository.LessonContentRepository;
import com.edore.backend.features.lesson.repository.LessonMetadataRepository;
import com.edore.backend.features.lesson.repository.LessonSpecification;
import com.edore.backend.features.lesson.service.LessonService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonMetadataRepository metadataRepository;
    private final LessonContentRepository contentRepository;
    private final ChapterRepository chapterRepository;

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
                .or(() -> metadataRepository.findByCode(lessonId))
                .orElseThrow(() -> new RuntimeException("Lesson metadata not found for ID/code: " + lessonId));

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
        LessonMetadata metadata = metadataRepository.findById(lessonId)
                .or(() -> metadataRepository.findByCode(lessonId))
                .orElseThrow(() -> new RuntimeException("Lesson metadata not found for ID/code: " + lessonId));

        LessonContent content = contentRepository.findById(metadata.getId())
                .orElseThrow(() -> new RuntimeException("Lesson content not found for lesson ID: " + metadata.getId()));

        return LessonForAIResponse.builder()
                .lessonId(metadata.getId())
                .rawContent(content.getRawContent())
                .images(metadata.getImages())
                .build();
    }

    @Override
    @Transactional
    public void updateOCRStatus(String lessonId, String status, String ocrFlag) {
        LessonMetadata metadata = metadataRepository.findById(lessonId)
                .or(() -> metadataRepository.findByCode(lessonId))
                .orElseThrow(() -> new RuntimeException("Lesson not found for ID/code: " + lessonId));
        metadata.setStatus(status);
        metadata.setOcrQualityFlag(ocrFlag);
        
        if (metadata.getCode() == null || metadata.getCode().isEmpty()) {
            String generatedCode = metadata.getSubjectCode() + metadata.getGradeCode().replaceAll("\\D+", "") + "_" + metadata.getTextbookCode() + "_bai" + metadata.getOrderInChapter();
            metadata.setCode(generatedCode);
        }
        metadataRepository.save(metadata);
    }

    @Override
    public PageResponseDTO<LessonSummaryResponse> searchLessons(LessonFilterRequestDTO filter) {
        Specification<LessonMetadata> spec = LessonSpecification.filter(filter);

        Sort sort = Sort.by(
                filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC,
                filter.getValidSortBy()
        );
        Pageable pageable = PageRequest.of(filter.getPageNumber(), filter.getPageSize(), sort);

        Page<LessonMetadata> page = metadataRepository.findAll(spec, pageable);

        Map<String, String> chapterTitleMap = chapterRepository.findAll().stream()
                .filter(c -> c.getId() != null && c.getTitle() != null)
                .collect(Collectors.toMap(Chapter::getId, Chapter::getTitle, (a, b) -> a));

        Page<LessonSummaryResponse> dtoPage = page.map(m -> LessonSummaryResponse.builder()
                .id(m.getId())
                .code(m.getCode())
                .title(m.getTitle())
                .orderInChapter(m.getOrderInChapter())
                .gradeCode(m.getGradeCode())
                .subjectCode(m.getSubjectCode())
                .textbookCode(m.getTextbookCode())
                .chapterId(m.getChapterId())
                .chapterTitle(m.getChapterId() != null ? chapterTitleMap.get(m.getChapterId()) : null)
                .build());

        return PageResponseDTO.of(dtoPage, filter.getValidSortBy(), filter.isAscending() ? "ASC" : "DESC");
    }
}
