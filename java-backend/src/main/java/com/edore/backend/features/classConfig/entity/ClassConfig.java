package com.edore.backend.features.classroom.entity;

import com.edore.backend.features.auth.entity.User;
import com.edore.backend.features.classConfig.model.*;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "class_configs")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
@EntityListeners(AuditingEntityListener.class)
public class ClassConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Column(name = "name", length = 255)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(name = "duration", length = 50)
    private LessonDuration duration;

    @Enumerated(EnumType.STRING)
    @Column(name = "class_size", length = 50)
    private ClassSizeRange classSize;

    @Enumerated(EnumType.STRING)
    @Column(name = "space", length = 100)
    private ClassroomSpace space;

    @Enumerated(EnumType.STRING)
    @Column(name = "seating_layout", length = 100)
    private SeatingLayout seatingLayout;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "infrastructure", columnDefinition = "varchar[]")
    @Enumerated(EnumType.STRING)
    private List<InfrastructureItem> infrastructure;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "student_devices", columnDefinition = "varchar[]")
    @Enumerated(EnumType.STRING)
    private List<StudentDeviceOption> studentDevices;

    @CreatedDate
    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt;
}
