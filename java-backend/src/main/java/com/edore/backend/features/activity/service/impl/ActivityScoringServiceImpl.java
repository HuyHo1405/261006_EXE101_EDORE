package com.edore.backend.features.activity.service.impl;

import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.repository.ActivityRepository;
import com.edore.backend.features.activity.service.ActivityScoringService;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.script.entity.NodeType;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.dto.MatchResult;
import com.edore.backend.features.vector.dto.ReferenceMatchResult;
import com.edore.backend.features.vector.service.VectorMatchService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Slf4j
@Service
@EnableConfigurationProperties(VectorMatchProperties.class)
@RequiredArgsConstructor
public class ActivityScoringServiceImpl implements ActivityScoringService {

    private final ActivityRepository      activityRepository;
    private final VectorMatchService     vectorMatchService;
    private final VectorMatchProperties vectorMatchProperties;

    @Override
    public List<Activity> getTopActivityEntities(NodeType nodeType, ClassConfig classConfig, String nodeIntent, int limit) {

        List<Activity> all = activityRepository.findAll();
        String space = classConfig.getSpace() != null ? classConfig.getSpace().name() : "";
        List<String> devices = classConfig.getStudentDevices() != null ? classConfig.getStudentDevices().stream().map(Enum::name).toList() : List.of();
        int durationMinutes = classConfig.getDuration() != null ? classConfig.getDuration().getMinutes() : 45;
        String classSize = classConfig.getClassSize() != null ? classConfig.getClassSize().name() : "MEDIUM";

        Map<String, Double> vectorScores = new HashMap<>();
        if (vectorMatchService.isAvailable() && nodeIntent != null && !nodeIntent.isBlank()) {
            try {
                ReferenceMatchResult vResult = vectorMatchService.findSimilarReferences(
                        nodeIntent,
                        vectorMatchProperties.collectionActivities(),
                        10,
                        null
                );
                for (MatchResult m : vResult.matches()) {
                    vectorScores.put(m.docId(), m.score());
                }
            } catch (Exception e) {
                log.warn("[ActivityScoring] Vector search for activities failed silently: {}", e.getMessage());
            }
        }

        List<int[]> scored = new ArrayList<>();

        for (int i = 0; i < all.size(); i++) {
            Activity act = all.get(i);
            int score = 0;

            if (!space.isEmpty() && act.getAllowedSpace() != null
                    && !act.getAllowedSpace().isEmpty()
                    && !act.getAllowedSpace().contains(space)) {
                score -= 100;
            }

            if (act.getRequiredDevices() != null) {
                for (String req : act.getRequiredDevices()) {
                    if (!devices.contains(req)) {
                        score -= 100;
                        break;
                    }
                }
            }

            boolean nodeMatch = act.getNodeTypes() != null
                    && nodeType != null
                    && act.getNodeTypes().contains(nodeType.getId());
            if (nodeMatch) score += 30;

            if (nodeIntent != null && !nodeIntent.isBlank()) {
                String intentLower = nodeIntent.toLowerCase();
                String searchText  = ((act.getTitle() != null ? act.getTitle() : "")
                        + " " + (act.getContent() != null ? act.getContent() : "")).toLowerCase();

                String[] words = intentLower.split("\\s+");
                for (String w : words) {
                    if (w.length() > 3 && searchText.contains(w)) {
                        score += 5;
                    }
                }
            }

            Double vectorSim = vectorScores.get(act.getId() != null ? act.getId().toString() : "");
            if (vectorSim != null && vectorSim > 0.0) {
                score += (int) Math.round(vectorSim * 20.0);
            }

            if (durationMinutes <= 45 && act.getAllowedDuration() != null
                    && act.getAllowedDuration().stream()
                           .noneMatch(d -> d.equals("30") || d.equals("45"))) {
                score -= 20;
            } else if (act.getAllowedDuration() != null
                    && act.getAllowedDuration().stream().anyMatch(d -> d.equals(String.valueOf(durationMinutes)))) {
                score += 3;
            }

            if ("<=10".equals(classSize)) {
                if (act.getAllowedClassSize() != null
                        && !act.getAllowedClassSize().contains("<=10")) {
                    score -= 10;
                }
            }

            scored.add(new int[]{i, score});
        }

        scored.sort((a, b) -> Integer.compare(b[1], a[1]));

        List<Activity> valid = scored.stream()
                .filter(s -> s[1] > -50)
                .map(s -> all.get(s[0]))
                .collect(Collectors.toList());

        if (valid.isEmpty()) {
            valid = scored.stream()
                    .limit(limit)
                    .map(s -> all.get(s[0]))
                    .collect(Collectors.toList());
        }

        return valid.stream()
                .limit(limit)
                .collect(Collectors.toList());
    }
}
