package com.edore.backend.features.lesson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "lesson_question", indexes = @Index(name = "idx_question_lesson_stage", columnList = "lesson_code,stage_tag"))
@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class LessonQuestion {
    @Id private String id;
    private String lessonId;
    private String lessonCode;
    @Column(columnDefinition = "TEXT") private String questionText;
    @Column(name = "option_1", columnDefinition = "TEXT") private String option1;
    @Column(name = "option_2", columnDefinition = "TEXT") private String option2;
    @Column(name = "option_3", columnDefinition = "TEXT") private String option3;
    @Column(name = "option_4", columnDefinition = "TEXT") private String option4;
    private Integer correctAnswer;
    private Integer timeLimit;
    private String stageTag;
    private String difficulty;
    @Column(columnDefinition = "TEXT") private String explanation;
}
