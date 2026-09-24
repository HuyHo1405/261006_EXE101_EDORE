package com.edore.backend.features.script.repository;

import com.edore.backend.features.script.entity.ScriptNode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ScriptNodeRepository extends JpaRepository<ScriptNode, Long> {
    List<ScriptNode> findByScriptIdOrderByOrderIndexAsc(UUID scriptId);
    void deleteByScriptId(UUID scriptId);
}

