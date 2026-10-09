package com.edore.backend.features.lesson.repository;

import com.edore.backend.features.lesson.entity.LessonContent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonContentRepository extends JpaRepository<LessonContent, String> {
}
