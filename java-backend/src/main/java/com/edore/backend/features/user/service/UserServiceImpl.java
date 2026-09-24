package com.edore.backend.features.user.service;

import com.edore.backend.core.dto.response.PageResponseDTO;
import com.edore.backend.core.exception.ApiException;
import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.auth.repository.UserRepository;
import com.edore.backend.features.user.code.UserResponseCode;
import com.edore.backend.features.user.dto.request.UserFilterRequestDTO;
import com.edore.backend.features.user.dto.request.UserUpdateRequest;
import com.edore.backend.features.user.dto.response.UserResponse;
import com.edore.backend.features.user.repository.UserSpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public UserResponse getProfile(UUID id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(UserResponseCode.USER_NOT_FOUND));
        return toResponse(user);
    }

    @Override
    @Transactional
    public void updateProfile(UUID id, UserUpdateRequest request) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ApiException(UserResponseCode.USER_NOT_FOUND));

        userRepository.findByEmail(request.email()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ApiException(UserResponseCode.EMAIL_ALREADY_EXISTS);
            }
        });

        userRepository.findByPhone(request.phone()).ifPresent(existing -> {
            if (!existing.getId().equals(id)) {
                throw new ApiException(UserResponseCode.PHONE_ALREADY_EXISTS);
            }
        });

        user.setUsername(request.fullName());
        user.setEmail(request.email());
        user.setPhone(request.phone());
        userRepository.save(user);
    }

    @Override
    public PageResponseDTO<UserResponse> getAllUsersForAdmin(UserFilterRequestDTO filter) {
        Pageable pageable = createUserPageable(filter);
        Specification<User> spec = UserSpecification.filter(filter);
        Page<UserResponse> page = userRepository.findAll(spec, pageable).map(this::toResponse);
        return PageResponseDTO.of(page);
    }

    // ─── Helpers ─────────────────────────────────────────────────────────────

    private Pageable createUserPageable(UserFilterRequestDTO filter) {
        if (filter == null) {
            return PageRequest.of(0, 10, Sort.by(Sort.Direction.DESC, "createdAt"));
        }
        Sort.Direction direction = filter.isAscending() ? Sort.Direction.ASC : Sort.Direction.DESC;
        return PageRequest.of(filter.getPageNumber(), filter.getPageSize(), Sort.by(direction, filter.getValidSortBy()));
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getUsername(),
                user.getEmail(),
                user.getPhone()
        );
    }
}
