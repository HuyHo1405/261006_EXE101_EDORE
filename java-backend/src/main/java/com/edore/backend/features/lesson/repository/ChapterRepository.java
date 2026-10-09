package com.edore.backend.features.lesson.repository;

import com.edore.backend.features.lesson.entity.Chapter;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ChapterRepository extends JpaRepository<Chapter, String> {
    List<Chapter> findAllByOrderByOrderAsc();
}
