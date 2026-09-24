package com.edore.backend.features.course.service.impl;

import com.edore.backend.core.dto.response.EnumResponseDTO;
import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.repository.CategoryRepository;
import com.edore.backend.features.classConfig.dto.request.ClassConfigRequestDTO;
import com.edore.backend.features.classConfig.dto.response.ClassConfigResponseDTO;
import com.edore.backend.features.classConfig.service.ClassConfigService;
import com.edore.backend.features.classroom.entity.ClassConfig;
import com.edore.backend.features.classroom.repository.ClassConfigRepository;
import com.edore.backend.features.course.code.CourseResponseCode;
import com.edore.backend.features.course.dto.request.CourseFilterRequestDTO;
import com.edore.backend.features.course.dto.request.CourseIncludeOption;
import com.edore.backend.features.course.dto.request.CourseRequestDTO;
import com.edore.backend.features.course.dto.response.CourseDetailResponseDTO;
import com.edore.backend.features.course.dto.response.CourseResponseDTO;
import com.edore.backend.features.course.entity.Course;
import com.edore.backend.features.course.entity.CourseStatus;
import com.edore.backend.features.course.repository.CourseEnumRegistry;
import com.edore.backend.features.course.repository.CourseRepository;
import com.edore.backend.features.course.repository.CourseSpecification;
import com.edore.backend.features.course.service.CourseService;
import com.edore.backend.features.script.repository.ScriptRepository;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Slf4j
@Service
@RequiredArgsConstructor
public class CourseServiceImpl implements CourseService {

    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final CategoryRepository categoryRepository;
    private final ClassConfigRepository classConfigRepository;
    private final ClassConfigService classConfigService;
    private final CourseEnumRegistry courseEnumRegistry;
    private final ScriptRepository scriptRepository;


    // ── Mapping & Helpers ──────────────────────────────────────────────────────

    private CourseResponseDTO toResponse(Course entity) {
        return toResponse(entity, false);
    }

    private CourseResponseDTO toResponse(Course entity, boolean includeScripts) {
        List<CourseResponseDTO.CategorySummary> categories = entity.getCategories() == null
                ? List.of()
                : entity.getCategories().stream()
                        .map(c -> new CourseResponseDTO.CategorySummary(c.getId(), c.getName()))
                        .toList();

        int scriptCount = entity.getId() != null ? scriptRepository.countByCourseId(entity.getId()) : 0;

        List<CourseResponseDTO.ScriptSummary> scripts = null;
        if (includeScripts && entity.getId() != null) {
            scripts = scriptRepository.findByCourseIdOrderByCreatedAtDesc(entity.getId()).stream()
                    .map(s -> new CourseResponseDTO.ScriptSummary(s.getId(), s.getTitle()))
                    .toList();
        }

        return new CourseResponseDTO(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getTitle(),
                entity.getDescription(),
                entity.getStatus() != null ? entity.getStatus().name() : null,
                categories,
                scriptCount,
                scripts,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    private CourseDetailResponseDTO toDetailResponse(Course entity) {
        List<CourseDetailResponseDTO.CategorySummary> categories = entity.getCategories() == null
                ? List.of()
                : entity.getCategories().stream()
                        .map(c -> new CourseDetailResponseDTO.CategorySummary(c.getId(), c.getName()))
                        .toList();

        ClassConfigResponseDTO classConfigDTO = null;
        if (entity.getClassConfig() != null) {
            classConfigDTO = classConfigService.getById(entity.getClassConfig().getId());
        }

        int scriptCount = entity.getId() != null ? scriptRepository.countByCourseId(entity.getId()) : 0;

        return new CourseDetailResponseDTO(
                entity.getId(),
                entity.getUser() != null ? entity.getUser().getId() : null,
                entity.getTitle(),
                entity.getDescription(),
                entity.getStatus() != null ? entity.getStatus().name() : null,
                categories,
                classConfigDTO,
                scriptCount,
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }


    private CourseStatus parseStatus(String status) {
        if (status == null || status.isBlank()) return CourseStatus.DRAFT;
        try {
            return CourseStatus.valueOf(status.toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ApiException(CourseResponseCode.INVALID_STATUS);
        }
    }

    private Set<Category> resolveCategories(Set<Long> categoryIds) {
        if (categoryIds == null || categoryIds.isEmpty()) return new HashSet<>();
        return new HashSet<>(categoryRepository.findAllById(categoryIds));
    }

    private Pageable createPageable(CourseFilterRequestDTO filter) {
        if (filter == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPageNumber(), filter.getPageSize(), Sort.by(direction, filter.getValidSortBy()));
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @Override
    @Transactional
    public CourseDetailResponseDTO create(UUID userId, CourseRequestDTO request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        ClassConfig classConfigToAssign = null;


        // Option A: Clone selected ClassConfig preset by ID
        if (request.classConfigId() != null) {
            ClassConfig preset = classConfigRepository.findById(request.classConfigId())
                    .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

            classConfigToAssign = cloneClassConfig(preset, user, request.title());
        }
        // Option B: Create new custom ClassConfig inline from request object
        else if (request.classConfigRequest() != null) {
            ClassConfigRequestDTO cfg = request.classConfigRequest();
            classConfigToAssign = ClassConfig.builder()
                    .user(user)
                    .name(cfg.name())
                    .duration(cfg.duration())
                    .classSize(cfg.classSize())
                    .space(cfg.space())
                    .seatingLayout(cfg.seatingLayout())
                    .infrastructure(cfg.infrastructure())
                    .studentDevices(cfg.studentDevices())
                    .build();
        }
        // Option C: Create a default ClassConfig snapshot for this course
        else {
            classConfigToAssign = ClassConfig.builder()
                    .user(user)
                    .name("Cấu hình lớp học - " + request.title())
                    .duration(com.edore.backend.features.classConfig.model.LessonDuration.MIN_45)
                    .classSize(com.edore.backend.features.classConfig.model.ClassSizeRange.MEDIUM)
                    .space(com.edore.backend.features.classConfig.model.ClassroomSpace.STANDARD)

                    .seatingLayout(com.edore.backend.features.classConfig.model.SeatingLayout.ROWS)
                    .infrastructure(List.of(
                            com.edore.backend.features.classConfig.model.InfrastructureItem.WHITEBOARD,
                            com.edore.backend.features.classConfig.model.InfrastructureItem.PROJECTOR
                    ))
                    .studentDevices(List.of(com.edore.backend.features.classConfig.model.StudentDeviceOption.NONE))
                    .build();
        }


        Course course = Course.builder()
                .user(user)
                .title(request.title())
                .description(request.description())
                .status(parseStatus(request.status()))
                .categories(resolveCategories(request.categoryIds()))
                .classConfig(classConfigToAssign)
                .build();

        Course saved = courseRepository.save(course);
        log.info("[Course] Created id={} with dedicated classConfigId={} for userId={}", saved.getId(), saved.getClassConfig().getId(), userId);
        return toDetailResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponseDTO getById(UUID id, UUID userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        return toDetailResponse(course);
    }

    @Override
    @Transactional(readOnly = true)
    public CourseDetailResponseDTO getById(UUID id) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));
        return toDetailResponse(course);
    }


    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<CourseResponseDTO> getCourses(CourseFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<Course> spec = CourseSpecification.filter(filter, null);
        boolean includeScripts = filter != null && filter.include() == CourseIncludeOption.SCRIPTS;
        Page<CourseResponseDTO> page = courseRepository.findAll(spec, pageable).map(c -> toResponse(c, includeScripts));
        return PageResponseDTO.of(page);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponseDTO<CourseResponseDTO> getByUser(UUID userId, CourseFilterRequestDTO filter) {
        Pageable pageable = createPageable(filter);
        Specification<Course> spec = CourseSpecification.filter(filter, userId);
        boolean includeScripts = filter != null && filter.include() == CourseIncludeOption.SCRIPTS;
        Page<CourseResponseDTO> page = courseRepository.findAll(spec, pageable).map(c -> toResponse(c, includeScripts));
        return PageResponseDTO.of(page);
    }



    @Override
    @Transactional
    public CourseDetailResponseDTO update(UUID id, UUID userId, CourseRequestDTO request) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setStatus(parseStatus(request.status()));
        course.setCategories(resolveCategories(request.categoryIds()));

        Course saved = courseRepository.save(course);
        log.info("[Course] Updated id={} by userId={}", id, userId);
        return toDetailResponse(saved);
    }

    @Override
    @Transactional
    public CourseDetailResponseDTO assignClassConfig(UUID courseId, UUID userId, Long classConfigId) {
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        ClassConfig preset = classConfigRepository.findById(classConfigId)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        // Clone dedicated snapshot for this course
        ClassConfig dedicatedSnapshot = cloneClassConfig(preset, course.getUser(), course.getTitle());
        course.setClassConfig(dedicatedSnapshot);

        Course saved = courseRepository.save(course);
        log.info("[Course] Assigned cloned classConfigId={} to courseId={} by userId={}", dedicatedSnapshot.getId(), courseId, userId);
        return toDetailResponse(saved);
    }

    private ClassConfig cloneClassConfig(ClassConfig source, User user, String courseTitle) {
        return ClassConfig.builder()
                .user(user)
                .name(source.getName() != null ? source.getName() : ("Cấu hình lớp - " + courseTitle))
                .duration(source.getDuration())
                .classSize(source.getClassSize())
                .space(source.getSpace())
                .seatingLayout(source.getSeatingLayout())
                .infrastructure(source.getInfrastructure() != null ? new ArrayList<>(source.getInfrastructure()) : List.of())
                .studentDevices(source.getStudentDevices() != null ? new ArrayList<>(source.getStudentDevices()) : List.of())
                .build();
    }


    @Override
    @Transactional
    public void delete(UUID id, UUID userId) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new ApiException(CourseResponseCode.NOT_FOUND));

        if (course.getUser() == null || !course.getUser().getId().equals(userId)) {
            throw new ApiException(CourseResponseCode.FORBIDDEN);
        }

        courseRepository.delete(course);
        log.info("[Course] Deleted id={} by userId={}", id, userId);
    }

    @Override
    public List<EnumResponseDTO> getEnums() {
        return courseEnumRegistry.getCourseEnums();
    }
}
