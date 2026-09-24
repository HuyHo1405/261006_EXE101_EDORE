package com.edore.backend.features.classroom.repository;

import com.edore.backend.features.classroom.entity.ClassConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ClassConfigRepository extends JpaRepository<ClassConfig, Long>, JpaSpecificationExecutor<ClassConfig> {
    List<ClassConfig> findByUserId(UUID userId);
}

