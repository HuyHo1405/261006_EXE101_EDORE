package com.edore.backend.features.lesson.repository;

import com.edore.backend.features.lesson.entity.LessonMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LessonMetadataRepository extends JpaRepository<LessonMetadata, String> {
}
