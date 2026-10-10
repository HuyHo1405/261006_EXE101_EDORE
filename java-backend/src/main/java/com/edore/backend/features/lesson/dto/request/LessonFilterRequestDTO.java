package com.edore.backend.features.lesson.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;

public record LessonFilterRequestDTO(
        @Schema(description = "Từ khóa tìm kiếm theo tên hoặc mã bài học (VD: 'Cách mạng', 'bài 1', 'LS8')", example = "Cách mạng")
        String keyword,

        @Schema(description = "Khối lớp (VD: '6', '7', '8')", example = "8")
        String gradeCode,

        @Schema(description = "Mã môn học (VD: 'LS')", example = "LS")
        String subjectCode,

        @Schema(description = "Mã bộ sách (VD: 'KNTT', 'CTST', 'CD')", example = "KNTT")
        String textbookCode,

        @Schema(description = "Lọc theo ID chương")
        String chapterId,

        @Schema(description = "Lọc theo số thứ tự bài học trong chương (VD: 1, 2)")
        Integer orderInChapter,

        @Schema(description = "Số trang (bắt đầu từ 0)", defaultValue = "0")
        Integer page,

        @Schema(description = "Số phần tử mỗi trang", defaultValue = "20")
        Integer size,

        @Schema(description = "Trường sắp xếp (orderInChapter, title, createdAt)", defaultValue = "orderInChapter")
        String sortBy,

        @Schema(description = "Thứ tự sắp xếp (ASC hoặc DESC)", defaultValue = "ASC")
        String sortDirection
) {
    public int getPageNumber() {
        return (page == null || page < 0) ? 0 : page;
    }

    public int getPageSize() {
        return (size == null || size <= 0) ? 20 : size;
    }

    public boolean isAscending() {
        return sortDirection == null || !"DESC".equalsIgnoreCase(sortDirection);
    }

    public String getValidSortBy() {
        if (sortBy == null || sortBy.isBlank()) return "orderInChapter";
        return switch (sortBy) {
            case "title", "createdAt", "orderInChapter" -> sortBy;
            default -> "orderInChapter";
        };
    }
}
