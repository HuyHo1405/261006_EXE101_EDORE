package com.edore.backend.features.vector.client;

import java.util.List;

/**
 * Interface for generating text embedding vectors.
 * Independent of chat completions endpoint.
 */
public interface EmbeddingClient {

    /**
     * Generate an embedding vector for a single text snippet.
     */
    float[] embed(String text);

    /**
     * Generate embedding vectors for a batch of text snippets.
     */
    List<float[]> embedBatch(List<String> texts);
}
