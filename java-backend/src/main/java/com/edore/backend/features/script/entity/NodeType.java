package com.edore.backend.features.script.entity;

import com.edore.backend.features.script.model.NodeTypeEnum;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

@Entity
@Table(name = "node_types")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(onlyExplicitlyIncluded = true)
public class NodeType {

    @Id
    @Enumerated(EnumType.STRING)
    @Column(name = "id", nullable = false, length = 50)
    @EqualsAndHashCode.Include
    private NodeTypeEnum id;

    @Column(name = "code", nullable = false, length = 100)
    private String code;

    @Column(name = "name", nullable = false, length = 255)
    private String name;

    @Column(name = "description", columnDefinition = "text")
    private String description;
}
