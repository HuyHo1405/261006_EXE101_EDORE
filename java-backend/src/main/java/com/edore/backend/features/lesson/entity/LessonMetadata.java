package com.edore.backend.features.lesson.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "lesson_metadata")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LessonMetadata {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id; 

    @Column(name = "code")
    private String code; // e.g. "ls6_ctst_bai08"

    @Column(name = "chapter_id")
    private String chapterId;

    @Column(name = "grade_code")
    private String gradeCode;

    @Column(name = "textbook_code")
    private String textbookCode;

    private String subjectCode;

    @Column(name = "order_in_chapter")
    private Integer orderInChapter;

    private String title;

    @Column(name = "learning_objectives", columnDefinition = "TEXT")
    private String learningObjectives; // Stored as JSON string

    @Column(columnDefinition = "TEXT")
    private String images; // Stored as JSON string

    private Integer version;

    private String status;

    @Column(name = "ocr_quality_flag")
    private String ocrQualityFlag;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}


