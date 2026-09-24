package com.edore.backend.features.vector.service.impl;

import com.edore.backend.core.config.QdrantConnectionProperties;
import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.category.entity.CategoryType;
import com.edore.backend.features.vector.client.EmbeddingClient;
import com.edore.backend.features.vector.config.VectorMatchProperties;
import com.edore.backend.features.vector.dto.GroundingLevel;
import com.edore.backend.features.vector.dto.MatchResult;
import com.edore.backend.features.vector.dto.ReferenceMatchResult;
import com.edore.backend.features.vector.service.VectorMatchService;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.*;

@Slf4j
@Service
@EnableConfigurationProperties(VectorMatchProperties.class)
@RequiredArgsConstructor
public class QdrantMatchServiceImpl implements VectorMatchService {

    private final QdrantConnectionProperties connectionProperties;
    private final VectorMatchProperties      vectorMatchProperties;
    private final EmbeddingClient            embeddingClient;
    private final RestClient                 qdrantRestClient;
    private final ObjectMapper               objectMapper = new ObjectMapper();
    private Boolean lastPingSuccess = null;
    private long    lastPingTime    = 0;

    // ── Public API ────────────────────────────────────────────────────────────

    @Override
    public boolean isAvailable() {
        if (!connectionProperties.enabled()) {
            return false;
        }

        long now = System.currentTimeMillis();
        if (lastPingSuccess != null && (now - lastPingTime < 10_000)) {
            return lastPingSuccess;
        }

        try {
            qdrantRestClient.get()
                    .uri("/healthz")
                    .retrieve()
                    .toBodilessEntity();

            if (Boolean.FALSE.equals(lastPingSuccess)) {
                log.info("[QdrantMatchService] Qdrant server connection restored.");
            }
            lastPingSuccess = true;
            lastPingTime = now;
            return true;
        } catch (Exception e) {
            if (lastPingSuccess == null || lastPingSuccess) {
                log.info("[QdrantMatchService] Qdrant is offline or unreachable. Vector operations will be safely skipped.");
            }
            lastPingSuccess = false;
            lastPingTime = now;
            return false;
        }
    }

    @Override
    public ReferenceMatchResult findSimilarReferences(String text, String collection, int topK) {
        return findSimilarReferences(text, collection, topK, null);
    }

    @Override
    @SuppressWarnings("unchecked")
    public ReferenceMatchResult findSimilarReferences(String text, String collection, int topK,
                                                       Set<Category> categories) {
        if (!isAvailable() || text == null || text.isBlank()) {
            return ReferenceMatchResult.empty();
        }

        try {
            float[] vector = embeddingClient.embed(text);
            if (vector == null || vector.length == 0) {
                log.warn("[QdrantMatchService] Failed to generate vector embedding, returning empty result");
                return ReferenceMatchResult.empty();
            }

            int    limit            = topK > 0 ? topK : vectorMatchProperties.topK();
            String targetCollection = resolveCollection(collection);

            Map<String, Object> requestBody = buildSearchBody(vector, limit, categories);

            String uri = "/collections/" + targetCollection + "/points/search";

            String rawJson = qdrantRestClient.post()
                    .uri(uri)
                    .body(requestBody)
                    .retrieve()
                    .body(String.class);

            Map<String, Object> respMap    = objectMapper.readValue(rawJson, Map.class);
            List<Map<String, Object>> resultList = (List<Map<String, Object>>) respMap.get("result");

            if (resultList == null || resultList.isEmpty()) {
                return ReferenceMatchResult.empty();
            }

            List<MatchResult> matches = new ArrayList<>();
            double topScore = 0.0;

            for (Map<String, Object> point : resultList) {
                String id    = String.valueOf(point.get("id"));
                double score = point.get("score") instanceof Number n ? n.doubleValue() : 0.0;
                Map<String, Object> payload = (Map<String, Object>) point.get("payload");

                if (score > topScore) topScore = score;
                matches.add(new MatchResult(id, score, payload != null ? payload : Map.of()));
            }

            GroundingLevel level = classifyGrounding(topScore);

            log.info("[QdrantMatchService] Search collection='{}' filter={} topScore={} level={}",
                    targetCollection, buildFilterSummary(categories), topScore, level);

            return new ReferenceMatchResult(matches, topScore, level);

        } catch (Exception e) {
            log.warn("[QdrantMatchService] Search failed silently: {}", e.getMessage());
            return ReferenceMatchResult.empty();
        }
    }

    @Override
    public void indexDocument(String docId, String text, Map<String, Object> metadata, String collection) {
        if (!isAvailable() || text == null || text.isBlank()) {
            return;
        }

        try {
            float[] vector = embeddingClient.embed(text);
            if (vector == null || vector.length == 0) {
                log.warn("[QdrantMatchService] Failed to embed document for indexing docId={}", docId);
                return;
            }

            String targetCollection = resolveCollection(collection);
            createCollectionIfNotExists(targetCollection);

            Map<String, Object> payload = new HashMap<>(metadata != null ? metadata : Map.of());
            payload.put("text", text);

            // Qdrant only accepts unsigned integer or UUID as point ID.
            // Use name-based (v3) UUID so the same docId always maps to the same UUID (idempotent re-indexing).
            String pointId = docId != null
                    ? UUID.nameUUIDFromBytes(docId.getBytes(java.nio.charset.StandardCharsets.UTF_8)).toString()
                    : UUID.randomUUID().toString();

            Map<String, Object> point = Map.of(
                    "id",      pointId,
                    "vector",  vector,
                    "payload", payload
            );

            Map<String, Object> requestBody = Map.of("points", List.of(point));

            String uri = "/collections/" + targetCollection + "/points?wait=true";

            qdrantRestClient.put()
                    .uri(uri)
                    .body(requestBody)
                    .retrieve()
                    .toBodilessEntity();

            log.info("[QdrantMatchService] Indexed document docId={} into collection='{}'", docId, targetCollection);

        } catch (Exception e) {
            log.warn("[QdrantMatchService] Indexing failed silently for docId={}: {}", docId, e.getMessage());
        }
    }

    @Override
    public long countPoints(String collectionName) {
        if (!isAvailable()) return 0;
        String target = resolveCollection(collectionName);
        try {
            Map<String, Object> resp = qdrantRestClient.get()
                    .uri("/collections/" + target)
                    .retrieve()
                    .body(Map.class);
            if (resp != null && resp.get("result") instanceof Map<?, ?> result) {
                Object pointsCount = result.get("points_count");
                if (pointsCount instanceof Number num) {
                    return num.longValue();
                }
            }
        } catch (Exception e) {
            log.debug("[Qdrant] Could not fetch points count for collection '{}': {}", target, e.getMessage());
        }
        return 0;
    }

    @Override
    public void createCollectionIfNotExists(String collectionName) {
        if (!isAvailable()) return;
        String target = resolveCollection(collectionName);
        try {
            // Check if collection exists
            qdrantRestClient.get()
                    .uri("/collections/" + target)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            // If collection does not exist (404), create it
            log.info("[QdrantMatchService] Collection '{}' not found — creating with vector size {}",
                    target, connectionProperties.getValidVectorDim());
            try {
                Map<String, Object> body = Map.of(
                        "vectors", Map.of(
                                "size", connectionProperties.getValidVectorDim(),
                                "distance", "Cosine"
                        )
                );
                qdrantRestClient.put()
                        .uri("/collections/" + target)
                        .body(body)
                        .retrieve()
                        .toBodilessEntity();
                log.info("[QdrantMatchService] Collection '{}' created successfully.", target);
            } catch (Exception ex) {
                log.warn("[QdrantMatchService] Failed to create collection '{}': {}", target, ex.getMessage());
            }
        }
    }

    @Override
    public void recreateCollection(String collectionName) {
        if (!isAvailable()) return;
        String target = resolveCollection(collectionName);
        try {
            log.info("[QdrantMatchService] Dropping collection '{}' if exists...", target);
            qdrantRestClient.delete()
                    .uri("/collections/" + target)
                    .retrieve()
                    .toBodilessEntity();
        } catch (Exception e) {
            log.warn("[QdrantMatchService] Drop collection '{}' warning: {}", target, e.getMessage());
        }
        createCollectionIfNotExists(target);
    }

    // ── Private Helpers ───────────────────────────────────────────────────────

    private String resolveCollection(String collection) {
        return (collection != null && !collection.isBlank())
                ? collection
                : vectorMatchProperties.collectionCurriculum();
    }

    private Map<String, Object> buildSearchBody(float[] vector, int limit, Set<Category> categories) {
        Map<String, Object> body = new HashMap<>();
        body.put("vector", vector);
        body.put("limit",  limit);
        body.put("with_payload", true);

        Map<String, Object> filter = buildCategoryFilter(categories);
        if (filter != null) {
            body.put("filter", filter);
        }

        return body;
    }

    private Map<String, Object> buildCategoryFilter(Set<Category> categories) {
        if (categories == null || categories.isEmpty()) {
            return null;
        }

        List<Map<String, Object>> mustClauses = new ArrayList<>();

        categories.stream()
                .filter(c -> c.getType() == CategoryType.SUBJECT && c.getCode() != null)
                .findFirst()
                .ifPresent(c -> mustClauses.add(matchClause("subject", c.getCode())));

        categories.stream()
                .filter(c -> c.getType() == CategoryType.GRADE && c.getCode() != null)
                .findFirst()
                .ifPresent(c -> mustClauses.add(matchClause("grade", c.getCode())));

        if (mustClauses.isEmpty()) {
            return null;
        }

        return Map.of("must", mustClauses);
    }

    private Map<String, Object> matchClause(String key, String value) {
        return Map.of("key", key, "match", Map.of("value", value));
    }

    private GroundingLevel classifyGrounding(double topScore) {
        if (topScore >= vectorMatchProperties.similarityStrongThreshold()) return GroundingLevel.STRONG;
        if (topScore >= vectorMatchProperties.similarityWeakThreshold())   return GroundingLevel.WEAK;
        return GroundingLevel.NONE;
    }

    private String buildFilterSummary(Set<Category> categories) {
        if (categories == null || categories.isEmpty()) return "none";
        return categories.stream()
                .filter(c -> c.getType() == CategoryType.SUBJECT || c.getType() == CategoryType.GRADE)
                .map(Category::getCode)
                .toList()
                .toString();
    }
}
