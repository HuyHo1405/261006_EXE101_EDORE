package com.edore.backend.features.ai.service;

import java.util.List;
import java.util.Map;

/**
 * Semantic chunking + TF-IDF top-K retrieval.
 * Port from Python chunker.py — pure computation, no external dependencies.
 */
public interface ChunkingService {

    /** Split text into semantic chunks (event-boundary aware). */
    List<String> chunk(String text);

    /**
     * For each node (by code), retrieve the top-K most relevant chunks via TF-IDF.
     *
     * @param chunks    pre-chunked text segments
     * @param nodeCodes ordered list of node codes (e.g. "khoi_dong", "hinh_thanh", ...)
     * @return map of nodeCode → joined context string
     */
    Map<String, String> getContextPerNode(List<String> chunks, List<String> nodeCodes);

    /** Extract sentences containing temporal markers (dates, years, centuries). */
    String extractKeyFacts(String text);

    /** Extract heading lines H1–H3 as an outline string. */
    String extractOutline(String text);
}
