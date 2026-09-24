package com.edore.backend.features.script.repository;

import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.script.model.NodeTypeEnum;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NodeTypeRepository extends JpaRepository<NodeType, NodeTypeEnum> {
    Optional<NodeType> findByCode(String code);
}
