"""
ai_controller.py — HTTP layer cho AI pedagogy endpoints.

Controller chỉ làm:
1. Parse request / form / body
2. Gọi AIService hoặc OpenRouterService
3. Trả về JSON response

Business logic nằm hoàn toàn trong services/.
"""

from flask_openapi3 import APIBlueprint, FileStorage
from flask import request, jsonify, current_app
from pydantic import BaseModel, Field
from typing import Optional

from app.services.ai_service import (
    AIService,
    DEFAULT_SYSTEM_TEMPLATE,
    DEFAULT_RAG_ACTIVITIES,
    DEFAULT_NODE_NAMES,
)
from app.services.openrouter_service import OpenRouterService
from app.services.chunking_service import get_all_section_contexts, semantic_chunk, extract_outline

bp = APIBlueprint('ai', __name__)


# ─── Pydantic Request Schemas ─────────────────────────────────────────────────

class ChatRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="A single user prompt string.")
    messages: Optional[list] = Field(None, description="Full message history (role/content pairs).")
    model: Optional[str] = Field(None, description="Optional OpenRouter model override.")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature.")
    max_tokens: Optional[int] = Field(1000, description="Maximum tokens to generate.")


class MapRequest(BaseModel):
    extracted_knowledge: str = Field(..., description="Raw text extracted from source document.")
    system_template: str = Field(..., description="Lesson node template string.")
    model: Optional[str] = Field(None, description="Optional OpenRouter model override.")
    temperature: Optional[float] = Field(0.3, description="Sampling temperature.")
    lop: Optional[int] = Field(None, description="Grade level (optional for RAG validation)")
    bai_so: Optional[int] = Field(None, description="Lesson number (optional for RAG validation)")


class EnrichRequest(BaseModel):
    mapped_nodes: object = Field(..., description="Mapped node array or JSON string.")
    rag_activities: Optional[object] = Field(None, description="List of teaching methodology strings.")
    classroom_ctx: Optional[dict] = Field(None, description="Optional classroom context configuration.")
    model: Optional[str] = Field(None, description="Optional OpenRouter model override.")
    temperature: Optional[float] = Field(0.5, description="Sampling temperature.")


class ExtractRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, DOCX, or MD file to extract text from")


class PipelineRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, DOCX, or MD file for the full pipeline")
    lop: Optional[int] = Field(None, description="Grade level (optional for RAG validation)")
    bai_so: Optional[int] = Field(None, description="Lesson number (optional for RAG validation)")


# ─── Routes ───────────────────────────────────────────────────────────────────

@bp.post(
    '/chat',
    summary="General Chat Completion",
    description="Send a prompt or message history to OpenRouter and receive an AI-generated response."
)
def chat(body: ChatRequest):
    """POST /api/ai/chat"""
    prompt = body.prompt
    messages = body.messages
    model = body.model
    temperature = body.temperature if body.temperature is not None else 0.7
    max_tokens = body.max_tokens if body.max_tokens is not None else 1000

    if not prompt and not messages:
        return jsonify({"error": "Bad Request", "message": "Either 'prompt' or 'messages' must be provided."}), 400
    if not messages:
        messages = [{"role": "user", "content": prompt}]
    elif not isinstance(messages, list):
        return jsonify({"error": "Bad Request", "message": "'messages' must be a JSON array."}), 400

    result = OpenRouterService.generate_chat_completion(
        messages=messages, model=model, temperature=temperature, max_tokens=max_tokens
    )
    if result.get("success"):
        return jsonify({
            "success": True,
            "response": result.get("content"),
            "model": result.get("model"),
            "usage": result.get("usage"),
        }), 200
    else:
        error_msg = result.get("error", "Unknown error")
        status = 403 if "OPENROUTER_API_KEY is not set" in error_msg else 500
        return jsonify({"success": False, "error": error_msg}), status


@bp.post(
    '/pedagogy/extract',
    summary="Feature 1: Extract Raw Text (No AI)",
    description="Upload a file (PDF, DOCX, TXT, or MD) and extract its raw text. No AI used."
)
def extract_pedagogy(form: ExtractRequest):
    """POST /api/ai/pedagogy/extract"""
    file = form.file
    if not file or file.filename == '':
        return jsonify({"error": "Bad Request", "message": "No selected file."}), 400

    text, err = AIService.extract_text_from_file(file)
    if err:
        status = 415 if "Only PDF" in err else 500
        return jsonify({"success": False, "error": err}), status

    return jsonify({"success": True, "filename": file.filename, "extracted_text": text}), 200


@bp.post(
    '/pedagogy/map',
    summary="Feature 2: Map Knowledge to Template (AI)",
    description="Map extracted knowledge points into lesson nodes using OpenRouter AI."
)
def map_pedagogy(body: MapRequest):
    """POST /api/ai/pedagogy/map"""
    extracted_knowledge = body.extracted_knowledge
    system_template = body.system_template
    model = body.model
    temperature = body.temperature if body.temperature is not None else 0.3
    lop = body.lop
    bai_so = body.bai_so

    if not extracted_knowledge or not system_template:
        return jsonify({"error": "Bad Request", "message": "Both 'extracted_knowledge' and 'system_template' are required."}), 400

    outline = extract_outline(extracted_knowledge)
    result = OpenRouterService.map_knowledge_to_template(
        extracted_knowledge=extracted_knowledge,
        system_template=system_template,
        model=model,
        temperature=temperature,
        outline=outline,
        lop=lop,
        bai_so=bai_so,
    )
    if result.get("success"):
        return jsonify({"success": True, "mapped_nodes": result.get("content")}), 200
    return jsonify({"success": False, "error": result.get("error")}), 500


@bp.post(
    '/pedagogy/enrich',
    summary="Feature 3: Enrich Nodes with Activities (AI)",
    description="For each mapped lesson node, select and adapt the most suitable teaching activity."
)
def enrich_pedagogy(body: EnrichRequest):
    """POST /api/ai/pedagogy/enrich"""
    mapped_nodes = body.mapped_nodes
    rag_activities = body.rag_activities
    classroom_ctx = body.classroom_ctx
    model = body.model
    temperature = body.temperature if body.temperature is not None else 0.5

    if not mapped_nodes:
        return jsonify({"error": "Bad Request", "message": "'mapped_nodes' is required."}), 400
    if not rag_activities and not classroom_ctx:
        return jsonify({"error": "Bad Request", "message": "Either 'rag_activities' or 'classroom_ctx' is required."}), 400

    result = OpenRouterService.enrich_nodes_with_activities(
        mapped_nodes=mapped_nodes,
        rag_activities=rag_activities,
        model=model,
        temperature=temperature,
        classroom_ctx=classroom_ctx,
    )
    if result.get("success"):
        return jsonify({"success": True, "enriched_script": result.get("content")}), 200
    return jsonify({"success": False, "error": result.get("error")}), 500


@bp.post(
    '/pedagogy/pipeline',
    summary="Full Pipeline: Extract → Map → Enrich (Sync)",
    description=(
        "**Automated 3-phase pipeline** — upload a file and receive the final enriched pedagogical script."
    )
)
def pipeline_pedagogy(form: PipelineRequest):
    """POST /api/ai/pedagogy/pipeline — Legacy sync pipeline"""
    file = form.file
    if not file or file.filename == '':
        return jsonify({"error": "Bad Request", "message": "No selected file."}), 400

    # Phase 1: Extract
    extracted_text, err = AIService.extract_text_from_file(file)
    if err:
        return jsonify({"success": False, "error": f"Extraction failed: {err}"}), 415 if "Only PDF" in err else 500
    if not extracted_text:
        return jsonify({"error": "Unprocessable Entity", "message": "Extracted text is empty."}), 422

    # Phase 1b: Semantic Chunking
    chunks = semantic_chunk(extracted_text)
    section_contexts = get_all_section_contexts(
        text=extracted_text, node_names=DEFAULT_NODE_NAMES, k=5,
    )

    # Phase 2: Map
    outline = extract_outline(extracted_text)
    map_result = OpenRouterService.map_knowledge_to_template(
        extracted_knowledge=extracted_text,
        system_template=DEFAULT_SYSTEM_TEMPLATE,
        model=None,
        temperature=0.3,
        use_chunking=True,
        section_contexts=section_contexts,
        outline=outline,
        lop=form.lop,
        bai_so=form.bai_so,
    )
    if not map_result.get("success"):
        return jsonify({"success": False, "error": f"Mapping phase failed: {map_result.get('error')}"}), 500

    mapped_nodes = map_result.get("content")

    # Phase 3: Enrich
    enrich_result = OpenRouterService.enrich_nodes_with_activities(
        mapped_nodes=mapped_nodes,
        rag_activities=DEFAULT_RAG_ACTIVITIES,
        model=None,
        temperature=0.5,
    )
    if not enrich_result.get("success"):
        return jsonify({"success": False, "error": f"Enrichment phase failed: {enrich_result.get('error')}"}), 500

    return jsonify({
        "success": True,
        "raw_extracted_text": extracted_text,
        "chunks_info": {
            "total_chunks": len(chunks),
            "sections": list(section_contexts.keys()),
        },
        "mapped_nodes": mapped_nodes,
        "final_pedagogical_script": enrich_result.get("content"),
    }), 200


@bp.get(
    '/config',
    summary="AI Config Status",
    description="Check whether the OpenRouter API key is configured and what the default model is."
)
def get_config():
    """GET /api/ai/config"""
    return jsonify({
        "api_key_configured": bool(current_app.config.get('OPENROUTER_API_KEY')),
        "default_model": current_app.config.get('OPENROUTER_MODEL'),
    }), 200
