package com.edore.backend.features.lesson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson_content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonContent {

    @Id
    @Column(name = "lesson_id")
    private String lessonId;

    @Column(name = "raw_content", columnDefinition = "TEXT")
    private String rawContent;
}
