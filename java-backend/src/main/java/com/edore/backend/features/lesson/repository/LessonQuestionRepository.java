package com.edore.backend.features.lesson.repository;

import com.edore.backend.features.lesson.entity.LessonQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LessonQuestionRepository extends JpaRepository<LessonQuestion, String> {
    List<LessonQuestion> findByLessonCodeAndStageTagOrderByIdAsc(String lessonCode, String stageTag);
}
