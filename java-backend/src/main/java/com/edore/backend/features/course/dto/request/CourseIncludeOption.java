package com.edore.backend.features.course.dto.request;

import com.fasterxml.jackson.annotation.JsonCreator;
import org.springframework.core.convert.converter.Converter;
import org.springframework.stereotype.Component;

public enum CourseIncludeOption {
    SCRIPTS;

    @JsonCreator
    public static CourseIncludeOption fromString(String value) {
        if (value == null || value.isBlank()) return null;
        for (CourseIncludeOption option : values()) {
            if (option.name().equalsIgnoreCase(value.trim())) {
                return option;
            }
        }
        return null;
    }

    @Component
    public static class StringToCourseIncludeOptionConverter implements Converter<String, CourseIncludeOption> {
        @Override
        public CourseIncludeOption convert(String source) {
            return CourseIncludeOption.fromString(source);
        }
    }
}
