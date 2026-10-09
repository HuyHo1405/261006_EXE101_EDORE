package com.edore.backend.features.lesson.code;

import com.edore.backend.core.response.ResponseCode;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;

@Getter
@RequiredArgsConstructor
public enum LessonResponseCode implements ResponseCode {

    UPLOAD_FAILED(4001, "Failed to upload image", HttpStatus.BAD_REQUEST, "lesson.upload_failed"),
    LESSON_NOT_FOUND(4002, "Lesson not found", HttpStatus.NOT_FOUND, "lesson.not_found"),
    CHAPTER_NOT_FOUND(4003, "Chapter not found", HttpStatus.NOT_FOUND, "lesson.chapter_not_found"),
    CHAPTER_SUCCESS(1400, "Successfully processed chapter", HttpStatus.OK, "lesson.chapter_success"),
    LESSON_SUCCESS(1401, "Successfully processed lesson", HttpStatus.OK, "lesson.success");

    private final int code;
    private final String message;
    private final HttpStatus status;
    private final String key;

    @Override
    public String getDomain() {
        return "LESSON";
    }
}
