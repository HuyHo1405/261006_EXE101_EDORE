package com.edore.backend.features.lesson.service;

import com.edore.backend.features.lesson.dto.request.ChapterCreateRequest;
import com.edore.backend.features.lesson.dto.response.ChapterResponse;

import java.util.List;

public interface ChapterService {
    ChapterResponse createChapter(ChapterCreateRequest request);
    ChapterResponse getChapterById(String id);
    List<ChapterResponse> getAllChapters();
}
