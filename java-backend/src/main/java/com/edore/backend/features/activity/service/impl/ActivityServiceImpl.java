package com.edore.backend.features.activity.service.impl;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.activity.code.ActivityResponseCode;
import com.edore.backend.features.activity.dto.request.ActivityFilterRequestDTO;
import com.edore.backend.features.activity.dto.request.ActivityRequestDTO;
import com.edore.backend.features.activity.dto.response.ActivityDetailResponseDTO;
import com.edore.backend.features.activity.dto.response.ActivityResponseDTO;
import com.edore.backend.features.activity.entity.Activity;
import com.edore.backend.features.activity.repository.ActivityRepository;
import com.edore.backend.features.activity.repository.ActivitySpecification;
import com.edore.backend.features.activity.service.ActivityService;
import com.edore.backend.features.script.model.NodeTypeEnum;
import com.edore.backend.features.script.repository.NodeTypeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Slf4j
@Service
@RequiredArgsConstructor
public class ActivityServiceImpl implements ActivityService {

    private final ActivityRepository  activityRepository;
    private final NodeTypeRepository  nodeTypeRepository;

    // ── Mapping & Helpers ──────────────────────────────────────────────────────

    private ActivityResponseDTO toResponse(Activity entity) {
        return new ActivityResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getTitle(),
                entity.getContent(),
                entity.getDefaultMaterials(),
                entity.getDefaultStepTemplate()
        );
    }

    private ActivityDetailResponseDTO toDetailResponse(Activity entity) {
        List<ActivityDetailResponseDTO.NodeTypeSummary> nodeTypeSummaries =
                entity.getNodeTypes() == null ? List.of()
                : entity.getNodeTypes().stream()
                        .map(nt -> new ActivityDetailResponseDTO.NodeTypeSummary(nt, nt.name(), nt.getTitle()))
                        .toList();

        return new ActivityDetailResponseDTO(
                entity.getId(),
                entity.getCode(),
                entity.getTitle(),
                entity.getContent(),
                entity.getMaxScore(),
                entity.getDefaultMaterials(),
                entity.getDefaultStepTemplate(),
                entity.getAllowedDuration(),
                entity.getAllowedClassSize(),
                entity.getAllowedSpace(),
                entity.getAllowedSeatingLayout(),
                entity.getRequiredInfrastructure(),
                entity.getRequiredDevices(),
                nodeTypeSummaries,
                entity.getCreatedAt()
        );
    }

    private Set<NodeTypeEnum> resolveNodeTypes(Set<NodeTypeEnum> nodeTypeIds) {
        if (nodeTypeIds == null || nodeTypeIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(nodeTypeIds);
    }

    private Pageable createPageable(ActivityFilterRequestDTO filter) {
        if (filter == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPageNumber(), filter.getPageSize(),
                Sort.by(direction, filter.getValidSortBy()));
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ActivityDetailResponseDTO create(ActivityRequestDTO request) {
        Set<NodeTypeEnum> nodeTypes = resolveNodeTypes(request.nodeTypeIds());

        Activity entity = Activity.builder()
                .title(request.title())
                .content(request.content())
                .maxScore(request.maxScore())
                .allowedDuration(request.allowedDuration())
                .allowedClassSize(request.allowedClassSize())
                .allowedSpace(request.allowedSpace())
                .allowedSeatingLayout(request.allowedSeatingLayout())
                .requiredInfrastructure(request.requiredInfrastructure())
                .requiredDevices(request.requiredDevices())
                .nodeTypes(nodeTypes)
                .build();

        Activity saved = activityRepository.save(entity);
        log.info("[Activity] Created id={} title='{}'", saved.getId(), saved.getTitle());
        return toDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ActivityDetailResponseDTO getDetail(Long id) {
        Activity entity = activityRepository.findById(id)
                .orElseThrow(() -> new ApiException(ActivityResponseCode.NOT_FOUND));
        return toDetailResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ActivityResponseDTO> getActivities(ActivityFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<Activity> spec = ActivitySpecification.filter(filter);
        Page<ActivityResponseDTO> page = activityRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponseDTO.of(page);
    }

    @Override
    @Transactional
    public ActivityDetailResponseDTO update(Long id, ActivityRequestDTO request) {
        Activity entity = activityRepository.findById(id)
                .orElseThrow(() -> new ApiException(ActivityResponseCode.NOT_FOUND));

        entity.setTitle(request.title());
        entity.setContent(request.content());
        entity.setMaxScore(request.maxScore());
        entity.setAllowedDuration(request.allowedDuration());
        entity.setAllowedClassSize(request.allowedClassSize());
        entity.setAllowedSpace(request.allowedSpace());
        entity.setAllowedSeatingLayout(request.allowedSeatingLayout());
        entity.setRequiredInfrastructure(request.requiredInfrastructure());
        entity.setRequiredDevices(request.requiredDevices());
        entity.setNodeTypes(resolveNodeTypes(request.nodeTypeIds()));

        Activity saved = activityRepository.save(entity);
        log.info("[Activity] Updated id={}", id);
        return toDetailResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id) {
        Activity entity = activityRepository.findById(id)
                .orElseThrow(() -> new ApiException(ActivityResponseCode.NOT_FOUND));
        activityRepository.delete(entity);
        log.info("[Activity] Deleted id={}", id);
    }
}
