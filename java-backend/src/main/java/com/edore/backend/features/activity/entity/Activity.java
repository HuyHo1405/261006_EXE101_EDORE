package com.edore.backend.features.activity.entity;

import com.edore.backend.core.infrastructure.BaseAuditEntity;
import com.edore.backend.features.activity.enums.StepRole;
import com.edore.backend.features.script.model.NodeTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "activities")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class Activity extends BaseAuditEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    @EqualsAndHashCode.Include
    private Long id;

    @Column(name = "title", nullable = false, length = 255)
    private String title;

    @Column(name = "content", columnDefinition = "text")
    private String content;

    @Column(name = "code", length = 100)
    private String code;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "default_materials", columnDefinition = "varchar[]")
    private List<String> defaultMaterials;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "default_step_template", columnDefinition = "text[]")
    private List<String> defaultStepTemplate;

    // --- NEW: Ánh xạ vai trò từng bước ---
    // Độ dài của mảng này BẮT BUỘC bằng độ dài của defaultStepTemplate.
    // Ví dụ: ["LOGISTICS", "LOGISTICS", "PAYLOAD_MAIN"]
    @Enumerated(EnumType.STRING)
    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "step_field_mapping", columnDefinition = "varchar[]")
    private List<StepRole> stepFieldMapping; 

    @Column(name = "max_score")
    private Integer maxScore;

    // --- filter step 1: auto-match conditions with class_configs ---

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_duration", columnDefinition = "varchar[]")
    private List<String> allowedDuration;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_class_size", columnDefinition = "varchar[]")
    private List<String> allowedClassSize;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_space", columnDefinition = "varchar[]")
    private List<String> allowedSpace;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "allowed_seating_layout", columnDefinition = "varchar[]")
    private List<String> allowedSeatingLayout;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_infrastructure", columnDefinition = "varchar[]")
    private List<String> requiredInfrastructure;

    @JdbcTypeCode(SqlTypes.ARRAY)
    @Column(name = "required_devices", columnDefinition = "varchar[]")
    private List<String> requiredDevices;

    // --- REFACTORED: filter step 2: activity only fits certain node_types ---
    
    @Builder.Default
    @ElementCollection(targetClass = NodeTypeEnum.class)
    @CollectionTable(name = "activity_node_types", joinColumns = @JoinColumn(name = "activity_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "node_type")
    private Set<NodeTypeEnum> nodeTypes = new HashSet<>();

    public void setNodeTypes(Set<NodeTypeEnum> nodeTypes) {
        if (this.nodeTypes == null) {
            this.nodeTypes = new HashSet<>();
        } else {
            this.nodeTypes.clear();
        }
        if (nodeTypes != null) {
            this.nodeTypes.addAll(nodeTypes);
        }
    }
}
