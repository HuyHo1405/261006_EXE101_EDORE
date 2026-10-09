package com.edore.backend.features.lesson.service.impl;

import com.edore.backend.features.lesson.dto.request.ChapterCreateRequest;
import com.edore.backend.features.lesson.dto.response.ChapterResponse;
import com.edore.backend.features.lesson.entity.Chapter;
import com.edore.backend.features.lesson.repository.ChapterRepository;
import com.edore.backend.features.lesson.service.ChapterService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ChapterServiceImpl implements ChapterService {

    private final ChapterRepository chapterRepository;

    @Override
    @Transactional
    public ChapterResponse createChapter(ChapterCreateRequest request) {
        Chapter chapter = Chapter.builder()
                .id(request.getId())
                .title(request.getTitle())
                .description(request.getDescription())
                .order(request.getOrder())
                .build();
        
        Chapter saved = chapterRepository.save(chapter);
        return mapToResponse(saved);
    }

    @Override
    public ChapterResponse getChapterById(String id) {
        Chapter chapter = chapterRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Chapter not found"));
        return mapToResponse(chapter);
    }

    @Override
    public List<ChapterResponse> getAllChapters() {
        return chapterRepository.findAllByOrderByOrderAsc()
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private ChapterResponse mapToResponse(Chapter chapter) {
        return ChapterResponse.builder()
                .id(chapter.getId())
                .title(chapter.getTitle())
                .description(chapter.getDescription())
                .order(chapter.getOrder())
                .build();
    }
}
