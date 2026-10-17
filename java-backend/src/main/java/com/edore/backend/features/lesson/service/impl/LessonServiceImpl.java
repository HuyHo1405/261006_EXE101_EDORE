package com.edore.backend.features.lesson.service.impl;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.features.lesson.dto.request.LessonCreateRequest;
import com.edore.backend.features.lesson.dto.request.LessonFilterRequestDTO;
import com.edore.backend.features.lesson.dto.response.LessonForAIResponse;
import com.edore.backend.features.lesson.dto.response.LessonMetadataResponse;
import com.edore.backend.features.lesson.dto.response.LessonSummaryResponse;
import com.edore.backend.features.lesson.dto.response.CurriculumSemesterResponse;
import com.edore.backend.features.lesson.dto.response.CurriculumChapterResponse;
import com.edore.backend.features.lesson.dto.response.CurriculumLessonResponse;
import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.category.repository.CategoryRepository;
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

import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class LessonServiceImpl implements LessonService {

    private final LessonMetadataRepository metadataRepository;
    private final LessonContentRepository contentRepository;
    private final ChapterRepository chapterRepository;
    private final CategoryRepository categoryRepository;

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

        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        Sort sort;
        if ("gradeCode".equalsIgnoreCase(filter.getValidSortBy())) {
            sort = Sort.by(direction, "gradeCode")
                    .and(Sort.by(Sort.Direction.ASC, "orderInChapter"));
        } else {
            sort = Sort.by(direction, filter.getValidSortBy());
        }
        Pageable pageable = PageRequest.of(filter.getPageNumber(), filter.getPageSize(), sort);

        Page<LessonMetadata> page = metadataRepository.findAll(spec, pageable);

        Map<String, String> chapterTitleMap = chapterRepository.findAll().stream()
                .filter(c -> c.getId() != null && c.getTitle() != null)
                .collect(Collectors.toMap(Chapter::getId, Chapter::getTitle, (a, b) -> a));

        Map<String, String> chapterSemesterMap = chapterRepository.findAll().stream()
                .filter(c -> c.getId() != null && c.getSemesterCode() != null)
                .collect(Collectors.toMap(Chapter::getId, Chapter::getSemesterCode, (a, b) -> a));

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
                .semesterCode(m.getChapterId() != null ? chapterSemesterMap.get(m.getChapterId()) : null)
                .build());

        return PageResponseDTO.of(dtoPage, filter.getValidSortBy(), filter.isAscending() ? "ASC" : "DESC");
    }

    @Override
    @Transactional(readOnly = true)
    public List<CurriculumSemesterResponse> getCurriculum(LessonFilterRequestDTO filter) {
        List<LessonMetadata> lessons = metadataRepository.findAll(LessonSpecification.filter(filter));

        Map<String, Chapter> chapterById = chapterRepository.findAll().stream()
                .filter(c -> c.getId() != null)
                .collect(Collectors.toMap(Chapter::getId, c -> c, (a, b) -> a));

        Map<String, String> semesterNameByCode = categoryRepository.findByType(CategoryType.SEMESTER).stream()
                .collect(Collectors.toMap(Category::getCode, Category::getName, (a, b) -> a));

        // semesterCode -> chapterId -> lessons
        Map<String, Map<String, List<LessonMetadata>>> tree = new TreeMap<>();
        for (LessonMetadata m : lessons) {
            Chapter chapter = m.getChapterId() != null ? chapterById.get(m.getChapterId()) : null;
            if (chapter == null) continue;
            String semesterCode = chapter.getSemesterCode() != null ? chapter.getSemesterCode() : "";
            tree.computeIfAbsent(semesterCode, k -> new LinkedHashMap<>())
                    .computeIfAbsent(chapter.getId(), k -> new ArrayList<>())
                    .add(m);
        }

        List<CurriculumSemesterResponse> result = new ArrayList<>();
        tree.forEach((semesterCode, chapters) -> {
            List<CurriculumChapterResponse> chapterDtos = chapters.entrySet().stream()
                    .map(e -> {
                        Chapter ch = chapterById.get(e.getKey());
                        List<CurriculumLessonResponse> lessonDtos = e.getValue().stream()
                                .sorted(Comparator.comparing(LessonMetadata::getOrderInChapter,
                                        Comparator.nullsLast(Comparator.naturalOrder())))
                                .map(m -> CurriculumLessonResponse.builder()
                                        .id(m.getId())
                                        .code(m.getCode())
                                        .title(m.getTitle())
                                        .orderInChapter(m.getOrderInChapter())
                                        .gradeCode(m.getGradeCode())
                                        .subjectCode(m.getSubjectCode())
                                        .textbookCode(m.getTextbookCode())
                                        .learningObjectives(m.getLearningObjectives())
                                        .build())
                                .toList();
                        return CurriculumChapterResponse.builder()
                                .id(ch.getId())
                                .order(ch.getOrder())
                                .title(ch.getTitle())
                                .lessons(lessonDtos)
                                .build();
                    })
                    .sorted(Comparator.comparing(CurriculumChapterResponse::getOrder,
                            Comparator.nullsLast(Comparator.naturalOrder())))
                    .toList();

            result.add(CurriculumSemesterResponse.builder()
                    .semesterCode(semesterCode.isEmpty() ? null : semesterCode)
                    .semesterName(semesterNameByCode.get(semesterCode))
                    .chapters(chapterDtos)
                    .build());
        });
        return result;
    }
}

