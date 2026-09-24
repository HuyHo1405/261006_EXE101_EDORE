package com.edore.backend.features.vector.service;

import com.edore.backend.features.category.entity.Category;
import com.edore.backend.features.vector.dto.ReferenceMatchResult;

import java.util.Map;
import java.util.Set;

/**
 * Core contract for vector searching and indexing in Qdrant.
 */
public interface VectorMatchService {

    /**
     * Find similar reference documents in the specified Qdrant collection.
     */
    ReferenceMatchResult findSimilarReferences(String text, String collection, int topK);

    /**
     * Find similar reference documents filtered by course categories (subject + grade).
     */
    ReferenceMatchResult findSimilarReferences(String text, String collection, int topK, Set<Category> categories);

    /**
     * Index a single document into Qdrant.
     */
    void indexDocument(String docId, String text, Map<String, Object> metadata, String collection);

    /**
     * Ensure collection exists in Qdrant with correct vector dimension (1024).
     */
    void createCollectionIfNotExists(String collectionName);

    /**
     * Delete and recreate a collection in Qdrant (Drop & Create).
     */
    void recreateCollection(String collectionName);

    /**
     * Get number of points in a Qdrant collection.
     */
    long countPoints(String collectionName);

    /**
     * Check if vector service is enabled and reachable.
     */
    boolean isAvailable();
}
