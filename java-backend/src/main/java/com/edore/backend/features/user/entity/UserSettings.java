package com.edore.backend.features.user.entity;

import com.edore.backend.core.infrastructure.BaseAuditEntity;
import com.edore.backend.features.auth.entity.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import lombok.experimental.SuperBuilder;

import java.util.UUID;

@Entity
@Table(name = "user_settings")
@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@SuperBuilder
@EqualsAndHashCode(callSuper = false, onlyExplicitlyIncluded = true)
public class UserSettings extends BaseAuditEntity {

    @Id
    @Column(name = "user_id")
    @EqualsAndHashCode.Include
    private UUID userId;

    @OneToOne(fetch = FetchType.LAZY)
    @MapsId
    @JoinColumn(name = "user_id")
    @JsonIgnore
    private User user;

    /**
     * User-level toggle for async fact-check verification (Phase 2 pipeline).
     * When {@code true}: verification runs automatically after script generation.
     * When {@code false}: backend skips auto-verify; FE may prompt user to run on demand.
     */
    @Column(name = "enable_fact_check_verification", nullable = false, columnDefinition = "boolean default true")
    @Builder.Default
    private Boolean enableFactCheckVerification = true;

    @Column(name = "theme", length = 20)
    @Builder.Default
    private String theme = "light";

    @Column(name = "language", length = 10)
    @Builder.Default
    private String language = "vi";
}
