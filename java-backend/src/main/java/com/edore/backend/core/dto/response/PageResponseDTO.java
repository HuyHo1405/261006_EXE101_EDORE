package com.edore.backend.core.dto.response;

import org.springframework.data.domain.Page;

import java.util.List;

public record PageResponseDTO<T>(
        List<T> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean first,
        boolean last,
        String sortBy,
        String sortDirection
) {
    public static <T> PageResponseDTO<T> of(Page<T> page) {
        String sortBy = null;
        String sortDirection = null;
        if (page.getSort().isSorted()) {
            var order = page.getSort().iterator().next();
            sortBy = order.getProperty();
            sortDirection = order.getDirection().name();
        }
        return new PageResponseDTO<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                sortBy,
                sortDirection
        );
    }

    public static <T> PageResponseDTO<T> of(Page<T> page, String sortBy, String sortDirection) {
        return new PageResponseDTO<>(
                page.getContent(),
                page.getNumber(),
                page.getSize(),
                page.getTotalElements(),
                page.getTotalPages(),
                page.isFirst(),
                page.isLast(),
                sortBy,
                sortDirection
        );
    }
}
