package com.edore.backend.features.lesson.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "chapter")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Chapter {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String id;

    @Column(name = "chapter_order")
    private Integer order;

    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;
}
