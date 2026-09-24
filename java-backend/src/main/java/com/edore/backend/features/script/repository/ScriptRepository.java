package com.edore.backend.features.script.repository;

import com.edore.backend.features.script.entity.Script;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScriptRepository extends JpaRepository<Script, UUID> {
    List<Script> findByCourseIdOrderByCreatedAtDesc(UUID courseId);
    int countByCourseId(UUID courseId);
}

