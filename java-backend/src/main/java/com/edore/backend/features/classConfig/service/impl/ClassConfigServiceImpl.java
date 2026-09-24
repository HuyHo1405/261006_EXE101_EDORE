package com.edore.backend.features.classConfig.service.impl;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.classConfig.code.ClassConfigResponseCode;
import com.edore.backend.features.classConfig.dto.request.ClassConfigFilterRequestDTO;
import com.edore.backend.features.classConfig.dto.request.ClassConfigRequestDTO;
import com.edore.backend.features.classConfig.dto.response.ClassConfigResponseDTO;
import com.edore.backend.features.classConfig.repository.ClassConfigEnumRegistry;
import com.edore.backend.features.classConfig.repository.ClassConfigSpecification;
import com.edore.backend.features.classConfig.service.ClassConfigService;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.classroom.repository.ClassConfigRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class ClassConfigServiceImpl implements ClassConfigService {

    private final ClassConfigRepository classConfigRepository;
    private final UserRepository userRepository;
    private final ClassConfigEnumRegistry classConfigEnumRegistry;

    // ── Mapping & Helpers ──────────────────────────────────────────────────────

    private ClassConfigResponseDTO toResponse(ClassConfig entity) {
        return new ClassConfigResponseDTO(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getName(),
                entity.getDuration(),
                entity.getClassSize(),
                entity.getSpace(),
                entity.getSeatingLayout(),
                entity.getInfrastructure(),
                entity.getStudentDevices(),
                entity.getCreatedAt()
        );
    }

    private Pageable createPageable(ClassConfigFilterRequestDTO filter) {
        if (filter == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPageNumber(), filter.getPageSize(), Sort.by(direction, filter.getValidSortBy()));
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public ClassConfigResponseDTO create(UUID userId, ClassConfigRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(ClassConfigResponseCode.NOT_FOUND));

        ClassConfig entity = ClassConfig.builder()
                .user(user)
                .name(request.name())
                .duration(request.duration())
                .classSize(request.classSize())
                .space(request.space())
                .seatingLayout(request.seatingLayout())
                .infrastructure(request.infrastructure())
                .studentDevices(request.studentDevices())
                .build();

        ClassConfig saved = classConfigRepository.save(entity);
        log.info("[ClassConfig] Created id={} for userId={}", saved.getId(), userId);
        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassConfigResponseDTO getById(Long id, UUID userId) {
        ClassConfig entity = classConfigRepository.findById(id)
                .orElseThrow(() -> new ApiException(ClassConfigResponseCode.NOT_FOUND));

        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ApiException(ClassConfigResponseCode.FORBIDDEN);
        }

        return toResponse(entity);
    }

    @Override
    @Transactional(readOnly = true)
    public ClassConfigResponseDTO getById(Long id) {
        ClassConfig entity = classConfigRepository.findById(id)
                .orElseThrow(() -> new ApiException(ClassConfigResponseCode.NOT_FOUND));
        return toResponse(entity);
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ClassConfigResponseDTO> getClassConfigs(ClassConfigFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<ClassConfig> spec = ClassConfigSpecification.filter(filter, null);
        Page<ClassConfigResponseDTO> page = classConfigRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponseDTO.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<ClassConfigResponseDTO> getByUser(UUID userId, ClassConfigFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<ClassConfig> spec = ClassConfigSpecification.filter(filter, userId);
        Page<ClassConfigResponseDTO> page = classConfigRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponseDTO.of(page);
    }



    @Override
    @Transactional
    public ClassConfigResponseDTO update(Long id, UUID userId, ClassConfigRequestDTO request) {
        ClassConfig entity = classConfigRepository.findById(id)
                .orElseThrow(() -> new ApiException(ClassConfigResponseCode.NOT_FOUND));

        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ApiException(ClassConfigResponseCode.FORBIDDEN);
        }

        entity.setName(request.name());
        entity.setDuration(request.duration());
        entity.setClassSize(request.classSize());
        entity.setSpace(request.space());

        entity.setSeatingLayout(request.seatingLayout());
        entity.setInfrastructure(request.infrastructure());
        entity.setStudentDevices(request.studentDevices());

        ClassConfig saved = classConfigRepository.save(entity);
        log.info("[ClassConfig] Updated id={} by userId={}", id, userId);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public void delete(Long id, UUID userId) {
        ClassConfig entity = classConfigRepository.findById(id)
                .orElseThrow(() -> new ApiException(ClassConfigResponseCode.NOT_FOUND));

        if (entity.getUser() == null || !entity.getUser().getId().equals(userId)) {
            throw new ApiException(ClassConfigResponseCode.FORBIDDEN);
        }

        classConfigRepository.delete(entity);
        log.info("[ClassConfig] Deleted id={} by userId={}", id, userId);
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return classConfigEnumRegistry.getClassConfigEnums();
    }
}

