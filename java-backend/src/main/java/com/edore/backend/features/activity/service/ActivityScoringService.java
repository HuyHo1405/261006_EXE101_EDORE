package com.edore.backend.features.activity.service;

import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.script.entity.NodeType;

import java.util.List;

public interface ActivityScoringService {

    /**
     * Retrieve and score the top-K pedagogical activities for a given script node and classroom configuration.
     *
     * @param nodeType    Current script node (e.g., Khởi động, Luyện tập)
     * @param classConfig Classroom physical and pedagogical constraints
     * @param nodeIntent  Pedagogical goal of the node
     * @param limit       Max number of activities to return
     * @return List of top matched Activity entities
     */
    List<Activity> getTopActivityEntities(NodeType nodeType, ClassConfig classConfig, String nodeIntent, int limit);
}
