package com.edore.backend.features.script.util;

/**
 * Shared utility for classifying ScriptNode codes into pedagogical section keys
 * and verification strictness tiers.
 *
 * <p>Previously inlined as a private method inside {@code ChunkingServiceImpl}.
 * Extracted here so both chunking and verification share one canonical mapping,
 * eliminating the risk of the two diverging over time.</p>
 *
 * <h3>Node code format:</h3>
 * <pre>{templateId}-node_{sectionSuffix}   e.g. "3-node_khoi_dong"</pre>
 *
 * <h3>Strictness tiers:</h3>
 * <ul>
 *   <li><b>STRICT</b>  — {@code hinh_thanh} (knowledge formation): fact-critical content,
 *       requires RAG + LLM-judge verification.</li>
 *   <li><b>RELAXED</b> — all other node types (khoi_dong, luyen_tap, van_dung, tong_ket):
 *       cosine-similarity check only, numeric check disabled.</li>
 * </ul>
 */
public final class NodeCodeClassifier {

    private NodeCodeClassifier() {}

    // ── Section key mapping ───────────────────────────────────────────────────

    /**
     * Extracts the canonical section key from a node code.
     *
     * @param nodeCode e.g. {@code "3-node_khoi_dong"}
     * @return one of: {@code khoi_dong, hinh_thanh, luyen_tap, van_dung, tong_ket}
     */
    public static String toSectionKey(String nodeCode) {
        if (nodeCode == null) return "hinh_thanh";
        if (nodeCode.endsWith("khoi_dong"))  return "khoi_dong";
        if (nodeCode.endsWith("hinh_thanh")) return "hinh_thanh";
        if (nodeCode.endsWith("luyen_tap"))  return "luyen_tap";
        if (nodeCode.endsWith("van_dung"))   return "van_dung";
        if (nodeCode.endsWith("tong_ket"))   return "tong_ket";
        return "hinh_thanh"; // default fallback
    }

    // ── Strictness classification ─────────────────────────────────────────────

    /**
     * Returns {@code true} if this node type requires STRICT fact-check
     * (RAG retrieval + LLM-judge).
     *
     * <p>Only {@code hinh_thanh} is STRICT because it is the sole knowledge-formation
     * node whose factual claims are pedagogically authoritative and must match the
     * curriculum reference.</p>
     *
     * @param nodeCode the raw node code from {@link com.edore.backend.features.script.entity.NodeType}
     */
    public static boolean isStrictNode(String nodeCode) {
        return "hinh_thanh".equals(toSectionKey(nodeCode));
    }

    /**
     * Returns the human-readable strictness label for logging/audit purposes.
     */
    public static String strictnessLabel(String nodeCode) {
        return isStrictNode(nodeCode) ? "STRICT" : "RELAXED";
    }
}
