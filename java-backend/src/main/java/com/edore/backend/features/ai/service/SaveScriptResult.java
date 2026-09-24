package com.edore.backend.features.ai.service;

import com.edore.backend.features.script.entity.Script;
import com.edore.backend.features.script.entity.ScriptNode;

import java.util.List;

/**
 * Result of {@link ScriptPersistService#saveScript} — bundles both
 * the parent {@link Script} and the saved {@link ScriptNode} list so that
 * the async verification phase has node IDs without a second DB round-trip.
 */
public record SaveScriptResult(
        Script script,
        List<ScriptNode> savedNodes
) {}
