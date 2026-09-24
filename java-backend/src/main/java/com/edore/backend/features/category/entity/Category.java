package com.edore.backend.features.category.entity;

import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

/**
 * Represents a taxonomy tag that can be attached to a Course.
 *
 * Fields:
 *   type  — semantic role (SUBJECT / GRADE / PURPOSE / OTHER)
 *   code  — machine-readable key used as Qdrant payload filter value
 *           (e.g. "MATH", "GRADE_10", "EXAM_PREP")
 *   name  — human-readable label (e.g. "Toán học", "Lớp 10")
 */
@Entity
@Table(name = "categories")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", length = 20, nullable = false)
    @Builder.Default
    private CategoryType type = CategoryType.OTHER;

    @Column(name = "code", length = 50, unique = true)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;
}
