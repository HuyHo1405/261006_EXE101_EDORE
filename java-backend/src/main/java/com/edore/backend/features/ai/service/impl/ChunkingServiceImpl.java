package com.edore.backend.features.ai.service.impl;

import com.edore.backend.features.ai.service.ChunkingService;
import com.edore.backend.features.script.util.NodeCodeClassifier;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Port from Python chunker.py:
 * - Semantic chunking with event-boundary protection (temporal marker awareness)
 * - TF-IDF top-K retrieval with section query hints
 * - Key facts anchor extraction
 */
@Slf4j
@Service
public class ChunkingServiceImpl implements ChunkingService {

    // ── Constants (port from Python) ─────────────────────────────────────────

    private static final int CHUNK_MIN_CHARS    = 200;
    private static final int CHUNK_MAX_CHARS    = 3000;
    private static final int CHUNK_OVERLAP_SENTS = 2;
    private static final double ANCHOR_BOOST    = 2.0;

    /** Regex patterns for temporal markers (dates, years, centuries). */
    private static final List<Pattern> TEMPORAL_PATTERNS = List.of(
            Pattern.compile("(?i)(?:ngày\\s+)?\\b\\d{1,2}[-/]\\d{1,2}[-/]\\d{4}\\b"),
            Pattern.compile("(?i)(?:năm\\s+)?\\b\\d{1,4}\\s*(?:TCN|SCN|trước Công nguyên|Công nguyên)?\\b"),
            Pattern.compile("(?i)thế kỉ?\\s+[IVXLCDM]+|thế kỉ? thứ [IVXLCDM]+"),
            Pattern.compile("(?i)\\b(thập kỉ|thế kỉ|thiên niên kỉ|trước Công nguyên|Công nguyên)\\b"),
            Pattern.compile("(?i)\\b(âm lịch|dương lịch|công lịch)\\b"),
            Pattern.compile("\\b\\d{3,4}\\s*[-–]\\s*\\d{3,4}\\b"),
            Pattern.compile("(?i)ngày\\s+\\d{1,2}\\s+tháng\\s+\\d{1,2}(?:\\s+năm\\s+\\d{2,4})?")
    );

    /** Section query hints: node code suffix → keyword list (port from Python SECTION_QUERY_HINTS). */
    private static final Map<String, List<String>> SECTION_HINTS = Map.of(
            "khoi_dong", List.of("hook", "khởi động", "warm up", "tình huống thực tế", "câu hỏi",
                    "kích thích", "tư duy", "mở đầu", "dẫn nhập", "giới thiệu bài",
                    "trò chơi", "icebreaker", "motivation", "động lực", "bối cảnh"),
            "hinh_thanh", List.of("lý thuyết", "khái niệm", "định nghĩa", "nguyên lý", "core",
                    "theory", "giải thích", "nội dung chính", "kiến thức", "học sinh hiểu",
                    "cốt lõi", "trình bày", "phân tích", "cơ chế", "quá trình"),
            "luyen_tap", List.of("thực hành", "bài tập", "vận dụng", "practice", "exercise",
                    "áp dụng", "kiểm tra", "củng cố", "ôn tập", "review",
                    "đánh giá", "quiz", "hoạt động", "nhóm", "làm"),
            "van_dung", List.of("vận dụng", "ứng dụng", "thực tế", "apply", "application",
                    "dự án", "sáng tạo", "giải quyết vấn đề", "thực tiễn"),
            "tong_ket", List.of("tổng kết", "kết luận", "rút ra", "ghi nhớ", "bài học rút ra",
                    "ôn lại", "nhìn lại", "điểm chính", "takeaway", "wrap up",
                    "tóm tắt", "đánh giá cuối", "reflection")
    );

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    public List<String> chunk(String text) {
        return eventBoundaryChunk(text);
    }

    @Override
    public Map<String, String> getContextPerNode(List<String> chunks, List<String> nodeCodes) {
        if (chunks.isEmpty() || nodeCodes.isEmpty()) return Map.of();

        Map<String, String> result = new LinkedHashMap<>();
        int totalNodes = nodeCodes.size();

        for (int i = 0; i < nodeCodes.size(); i++) {
            String code = nodeCodes.get(i);
            // Extract the suffix (e.g. "3-node_khoi_dong" → "khoi_dong")
            String sectionKey = toSectionKey(code);
            List<String> topChunks = retrieveTopK(chunks, sectionKey, 8, i, totalNodes);
            result.put(code, String.join("\n\n---\n\n", topChunks));
        }
        return result;
    }

    @Override
    public String extractKeyFacts(String text) {
        if (text == null || text.isBlank()) return "";

        String[] sentences = text.split("(?<=[.!?\\n])\\s+|\n");
        List<String> anchors = new ArrayList<>();
        Set<String> seen = new HashSet<>();

        for (String sent : sentences) {
            sent = sent.strip();
            if (sent.length() < 5) continue;
            if (hasTemporalMarker(sent)) {
                String key = sent.substring(0, Math.min(80, sent.length())).toLowerCase();
                if (seen.add(key)) {
                    anchors.add("- " + sent);
                    if (anchors.size() >= 60) break;
                }
            }
        }
        if (anchors.isEmpty()) return "";
        return "KEY FACTS (CÁC MỐC THỜI GIAN VÀ SỰ KIỆN QUAN TRỌNG TỪ TÀI LIỆU GỐC):\n"
                + String.join("\n", anchors);
    }

    @Override
    public String extractOutline(String text) {
        if (text == null || text.isBlank()) return "";
        return Arrays.stream(text.split("\n"))
                .map(String::strip)
                .filter(l -> l.matches("^#{1,3}\\s.*"))
                .limit(20)
                .collect(Collectors.joining("\n"));
    }

    // ── Chunking ──────────────────────────────────────────────────────────────

    private List<String> eventBoundaryChunk(String text) {
        if (text == null || text.isBlank()) return List.of();

        // Split by heading boundaries first
        String[] sections = text.split("(?m)(?=^#{1,3}\\s)");
        List<String> allSentences = new ArrayList<>();

        for (String section : sections) {
            section = section.strip();
            if (section.isEmpty()) continue;
            String[] sents = section.split("(?<=[.!?])\\s+|(?<=\n)\n");
            for (String s : sents) {
                s = s.strip();
                if (!s.isEmpty()) allSentences.add(s);
            }
        }

        if (allSentences.isEmpty()) {
            return text.length() > CHUNK_MAX_CHARS
                    ? List.of(text.substring(0, CHUNK_MAX_CHARS))
                    : List.of(text);
        }

        List<String> chunks = new ArrayList<>();
        List<String> current = new ArrayList<>();
        int currentLen = 0;

        for (String sent : allSentences) {
            int sentLen = sent.length();
            boolean hasAnchor = hasTemporalMarker(sent);

            if (currentLen + sentLen + 1 > CHUNK_MAX_CHARS && !current.isEmpty()) {
                // Protect temporal boundary: allow slight overshoot
                if (hasAnchor && currentLen + sentLen + 1 <= (int) (CHUNK_MAX_CHARS * 1.3)) {
                    current.add(sent);
                    currentLen += sentLen + 1;
                    continue;
                }
                chunks.add(String.join(" ", current));

                // Overlap: carry last N sentences
                int overlapStart = Math.max(0, current.size() - CHUNK_OVERLAP_SENTS);
                List<String> overlap = new ArrayList<>(current.subList(overlapStart, current.size()));
                current = overlap;
                currentLen = current.stream().mapToInt(s -> s.length() + 1).sum();
            }
            current.add(sent);
            currentLen += sentLen + 1;
        }
        if (!current.isEmpty()) chunks.add(String.join(" ", current));

        return chunks.stream()
                .filter(c -> c.length() >= CHUNK_MIN_CHARS)
                .collect(Collectors.toList());
    }

    // ── TF-IDF Retrieval ──────────────────────────────────────────────────────

    private List<String> retrieveTopK(List<String> chunks, String sectionKey,
                                       int k, int nodeIndex, int totalNodes) {
        if (chunks.isEmpty()) return List.of();

        List<String> hints = SECTION_HINTS.getOrDefault(sectionKey, List.of());
        List<String> queryTokens = tokenize(String.join(" ", hints));

        if (queryTokens.isEmpty()) {
            return sequentialFallback(chunks, k, nodeIndex, totalNodes);
        }

        // Tokenize corpus
        List<List<String>> corpus = chunks.stream().map(this::tokenize).toList();

        // IDF over corpus + query
        List<List<String>> fullCorpus = new ArrayList<>(corpus);
        fullCorpus.add(queryTokens);
        Map<String, Double> idf = computeIdf(fullCorpus);

        // Score each chunk
        List<double[]> scored = new ArrayList<>(); // [index, score]
        for (int i = 0; i < corpus.size(); i++) {
            double score = tfidfScore(queryTokens, corpus.get(i), idf);
            if (hasTemporalMarker(chunks.get(i))) score *= ANCHOR_BOOST;
            scored.add(new double[]{i, score});
        }

        // Sort descending by score
        scored.sort((a, b) -> Double.compare(b[1], a[1]));

        List<Integer> topIndices = scored.stream()
                .filter(s -> s[1] > 0)
                .limit(k)
                .map(s -> (int) s[0])
                .collect(Collectors.toList());

        if (topIndices.isEmpty()) {
            return sequentialFallback(chunks, k, nodeIndex, totalNodes);
        }

        Collections.sort(topIndices); // preserve doc order
        return topIndices.stream().map(chunks::get).collect(Collectors.toList());
    }

    private List<String> sequentialFallback(List<String> chunks, int k, int nodeIndex, int totalNodes) {
        int center = (int) (chunks.size() * (nodeIndex + 0.5) / totalNodes);
        int start = Math.max(0, center - k / 2);
        int end = Math.min(chunks.size(), start + k);
        if (end == chunks.size()) start = Math.max(0, end - k);
        return new ArrayList<>(chunks.subList(start, end));
    }

    // ── TF-IDF helpers ────────────────────────────────────────────────────────

    private List<String> tokenize(String text) {
        return Arrays.stream(
                        text.toLowerCase()
                                .replaceAll("[^\\w\\s]", " ")
                                .split("\\s+"))
                .filter(t -> t.length() > 1)
                .collect(Collectors.toList());
    }

    private Map<String, Double> computeIdf(List<List<String>> corpus) {
        int N = corpus.size();
        Map<String, Integer> df = new HashMap<>();
        for (List<String> doc : corpus) {
            new HashSet<>(doc).forEach(term -> df.merge(term, 1, Integer::sum));
        }
        Map<String, Double> idf = new HashMap<>();
        df.forEach((term, freq) -> idf.put(term, Math.log((double) (N + 1) / (freq + 1)) + 1));
        return idf;
    }

    private double tfidfScore(List<String> queryTokens, List<String> docTokens, Map<String, Double> idf) {
        if (docTokens.isEmpty()) return 0.0;
        Map<String, Long> tf = docTokens.stream()
                .collect(Collectors.groupingBy(t -> t, Collectors.counting()));
        double total = docTokens.size();
        double score = queryTokens.stream()
                .filter(tf::containsKey)
                .mapToDouble(t -> (tf.get(t) / total) * idf.getOrDefault(t, 1.0))
                .sum();
        return score / Math.max(1, queryTokens.size());
    }

    // ── Temporal marker check ─────────────────────────────────────────────────

    private boolean hasTemporalMarker(String text) {
        return TEMPORAL_PATTERNS.stream().anyMatch(p -> p.matcher(text).find());
    }

    // ── Node code → section key mapping ──────────────────────────────────────

    /**
     * Delegates to {@link NodeCodeClassifier#toSectionKey(String)} — single source of truth.
     */
    private String toSectionKey(String nodeCode) {
        return NodeCodeClassifier.toSectionKey(nodeCode);
    }
}
