package com.edore.backend.features.activity.repository;

import com.edore.backend.features.activity.entity.Activity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ActivityRepository extends JpaRepository<Activity, Long>,
        JpaSpecificationExecutor<Activity> {
    Optional<Activity> findByCode(String code);
}

