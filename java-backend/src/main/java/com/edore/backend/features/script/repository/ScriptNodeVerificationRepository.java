package com.edore.backend.features.script.repository;

import com.edore.backend.features.script.entity.ScriptNodeVerification;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.Modifying;
import org.springframework.transaction.annotation.Transactional;

@Repository
public interface ScriptNodeVerificationRepository extends JpaRepository<ScriptNodeVerification, Long> {

    /** Delete verifications for a script. */
    @Modifying
    @Transactional
    @Query("DELETE FROM ScriptNodeVerification v WHERE v.scriptNode.script.id = :scriptId")
    void deleteByScriptId(@Param("scriptId") UUID scriptId);

    /** Load all verifications for a given script (used for SSE stream and GET endpoint). */
    @Query("""
            SELECT v FROM ScriptNodeVerification v
            JOIN FETCH v.scriptNode sn
            WHERE sn.script.id = :scriptId
            ORDER BY sn.orderIndex ASC
            """)
    List<ScriptNodeVerification> findByScriptIdOrderByNodeIndex(@Param("scriptId") UUID scriptId);

    /** Load verification for a single node (used for apply-suggestion + re-verify). */
    Optional<ScriptNodeVerification> findByScriptNodeId(Long scriptNodeId);

    /**
     * Count nodes that have at least one flagged claim (status=DONE, flaggedClaims non-empty array).
     * Uses native SQL to properly query JSONB array length.
     */
    @Query(value = """
            SELECT COUNT(v.id)
            FROM script_node_verifications v
            JOIN script_nodes sn ON sn.id = v.script_node_id
            WHERE sn.script_id = :scriptId
              AND v.status = 'DONE'
              AND v.flagged_claims IS NOT NULL
              AND jsonb_array_length(v.flagged_claims) > 0
            """, nativeQuery = true)
    long countFlaggedNodesByScriptId(@Param("scriptId") UUID scriptId);
}
