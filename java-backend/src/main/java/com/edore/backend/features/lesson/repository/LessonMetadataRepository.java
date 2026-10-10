package com.edore.backend.features.lesson.repository;

import com.edore.backend.features.lesson.entity.LessonMetadata;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface LessonMetadataRepository extends JpaRepository<LessonMetadata, String>, JpaSpecificationExecutor<LessonMetadata> {
    Optional<LessonMetadata> findByCode(String code);
}
