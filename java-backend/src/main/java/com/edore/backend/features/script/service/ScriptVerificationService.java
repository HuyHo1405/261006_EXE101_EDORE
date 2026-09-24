package com.edore.backend.features.script.service;

import com.edore.backend.features.script.entity.ScriptNode;

import java.util.List;
import java.util.Map;
import java.util.UUID;

/**
 * Contract for the fact-check verification pipeline (Phase 2).
 *
 * <p>Implementations must apply the correct strictness tier per node:
 * <ul>
 *   <li><b>STRICT</b>  (hinh_thanh) — RAG retrieval + LLM-judge per sentence</li>
 *   <li><b>RELAXED</b> (others)     — Cosine similarity vs contextPerNode only</li>
 * </ul>
 */
public interface ScriptVerificationService {

    /**
     * Asynchronously verify all nodes of a saved script.
     *
     * <p>Called from {@code AiPipelineServiceImpl} after {@code saveScript} completes.
     * Runs in a dedicated {@code verificationExecutor} thread pool — never on the HTTP request thread.</p>
     *
     * @param scriptId       the saved script's UUID (used for SSE events and DB lookups)
     * @param scriptNodes    ordered list of persisted ScriptNode entities
     * @param contextPerNode map of nodeCode → relevant text chunk (used for RELAXED cosine check)
     * @param rawText        full extracted file text (fallback for STRICT if curriculum collection is sparse)
     */
    void verifyScriptAsync(UUID scriptId,
                           List<ScriptNode> scriptNodes,
                           Map<String, String> contextPerNode,
                           String rawText);

    /**
     * Re-verify a single node on demand (triggered via POST /re-verify API).
     *
     * @param scriptNodeId   the ScriptNode ID to re-verify
     * @param contextPerNode map of nodeCode → context text (for RELAXED path)
     * @param rawText        full source text (STRICT fallback)
     */
    void reVerifyNode(Long scriptNodeId, Map<String, String> contextPerNode, String rawText);
}
