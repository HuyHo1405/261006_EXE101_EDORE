"""
ai_controller.py — HTTP layer cho AI pedagogy endpoints.

Controller chỉ làm:
1. Parse request / form / body
2. Gọi AIService hoặc OpenRouterService
3. Trả về JSON response hoặc EventStream (SSE)

Business logic nằm hoàn toàn trong services/.
"""

import re as _re
import json
from flask_openapi3 import APIBlueprint, FileStorage
from flask import request, jsonify, current_app, Response, stream_with_context
from pydantic import BaseModel, Field
from typing import Optional

from app.services.ai_service import (
    AIService,
    DEFAULT_SYSTEM_TEMPLATE,
    DEFAULT_RAG_ACTIVITIES,
    DEFAULT_NODE_NAMES,
    sse_event, sse_progress, sse_section, sse_done, sse_error,
    sse_content_summary, sse_chunks,
)
from app.services.openrouter_service import OpenRouterService
from app.services.chunking_service import get_all_section_contexts, semantic_chunk, extract_outline
from app.models.template_store import TemplateStore

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


class StreamPipelineRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, DOCX, or MD file to process")
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


# ─── Helper: FakeFile để truyền bytes vào service sau khi đọc trước ──────────

class _FakeFile:
    """Wraps raw bytes as a file-like object for AIService.extract_text_from_file."""
    def __init__(self, name, data):
        self.filename = name
        self._data = data
        self._pos = 0

    def read(self, n=-1):
        if n == -1:
            result = self._data[self._pos:]
            self._pos = len(self._data)
        else:
            result = self._data[self._pos:self._pos + n]
            self._pos += n
        return result

    def seek(self, offset, whence=0):
        if whence == 0:
            self._pos = offset
        elif whence == 1:
            self._pos += offset
        elif whence == 2:
            self._pos = len(self._data) + offset

    def tell(self):
        return self._pos


# ─── SSE Streaming Pipeline ───────────────────────────────────────────────────

def _run_streaming_pipeline(file, model, k_chunks, template_id, classroom_ctx, lop=None, bai_so=None):
    """
    Generator: Extract → Chunk → Single-Shot AI → stream SSE events.
    Ported from routes/stream.py (deleted in backend refactor).
    """
    total_steps = 3

    # ── Lấy template từ TemplateStore ─────────────────────────────────────────
    template = None
    if template_id:
        template = TemplateStore.get_by_id(template_id)
    if not template:
        template = TemplateStore.get_by_id('standard-3-node')

    nodes = template.get('nodes', []) if template else []
    if not nodes:
        nodes = [
            {"node_type": "Khởi động",          "goal": "Kích hoạt kiến thức nền và tạo hứng thú cho học sinh"},
            {"node_type": "Hình thành kiến thức", "goal": "Giới thiệu, giải thích và xây dựng các khái niệm, kiến thức mới cốt lõi"},
            {"node_type": "Luyện tập",            "goal": "Học sinh thực hành, làm các bài tập củng cố ngay tại lớp"},
        ]

    rag_activities = template.get('rag_activities', DEFAULT_RAG_ACTIVITIES) if template else DEFAULT_RAG_ACTIVITIES

    # ── Bước 1: Extract text ───────────────────────────────────────────────────
    yield sse_progress("📄 Đang trích xuất nội dung từ file...", 1, total_steps)

    extracted_text, err = AIService.extract_text_from_file(file)
    if err or not extracted_text:
        yield sse_error(err or "Không trích xuất được nội dung từ file.", None)
        return

    # ── Bước 2: Semantic Chunking ──────────────────────────────────────────────
    yield sse_progress("✂️ Đang phân tích và chia nhỏ nội dung thành các chunks ngữ nghĩa...", 2, total_steps)

    chunks = semantic_chunk(extracted_text)
    total_chunks = len(chunks)
    yield sse_chunks(chunks)

    section_contexts = {}
    is_large_file = len(extracted_text) > 40000

    if is_large_file:
        section_contexts = get_all_section_contexts(
            text=extracted_text,
            nodes=nodes,
            k=k_chunks,
        )
    else:
        for node in nodes:
            nt = node.get("node_type", "")
            section_contexts[nt] = extracted_text

    yield sse_event("metadata", {
        "total_chars": len(extracted_text),
        "total_chunks": total_chunks,
        "sections": list(section_contexts.keys()) if is_large_file else ["Direct-Pass (Full Text)"],
        "chunks_per_section": k_chunks if is_large_file else 0,
        "is_large_file": is_large_file,
    })

    # ── Bước 3: Single-Shot LLM Call ──────────────────────────────────────────
    yield sse_progress("⚡ AI đang tạo kịch bản bài học (Single-Shot)...", 3, total_steps)

    res = OpenRouterService.generate_single_shot_script(
        section_contexts=section_contexts,
        nodes=nodes,
        rag_activities=rag_activities,
        classroom_ctx=classroom_ctx,
        model=model,
    )

    if not res.get("success"):
        yield sse_error("Không thể tạo kịch bản bài học bằng Single-Shot.", res.get("error"))
        return

    # Parse JSON từ LLM
    content_str = res.get("content", "").strip()
    content_str = _re.sub(r'```json|```', '', content_str).strip()

    try:
        result_nodes = json.loads(content_str)
        if not isinstance(result_nodes, list):
            result_nodes = [result_nodes]
    except Exception as e:
        yield sse_error("JSON Parse Error trên kết quả của AI.", f"Error: {str(e)}\nRaw: {content_str}")
        return

    # Post-process: ép node_type đúng theo template
    for i, node in enumerate(result_nodes):
        if i < len(nodes):
            node["node_type"] = nodes[i]["node_type"]

    content_summary = " — ".join(n.get("title", "Không có tiêu đề") for n in result_nodes)
    yield sse_content_summary(content_summary)

    # Stream từng node cho frontend
    for i, node in enumerate(result_nodes):
        yield sse_section(node, i)

    yield sse_progress("✅ Hoàn thành kịch bản!", 3, total_steps)
    yield sse_done({
        "success": True,
        "content_summary": content_summary,
        "stats": {
            "total_chars_extracted": len(extracted_text),
            "total_chunks": total_chunks,
            "nodes_mapped": len(nodes),
            "nodes_enriched": len(result_nodes),
            "errors": [],
        },
        "raw_extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
        "mapped_nodes": result_nodes,
        "final_pedagogical_script": result_nodes,
    })


@bp.post(
    '/pedagogy/pipeline',
    summary="Pipeline Single-Shot (SSE Streaming)",
    description=(
        "**Single-Shot Streaming Pipeline (SSE)** — Khởi chạy Single-Shot pipeline, trả dữ liệu dần về qua EventStream.\n"
        "Nhận các form fields cấu hình lớp học và file văn bản giáo án."
    )
)
def stream_pipeline(form: StreamPipelineRequest):
    """POST /api/ai/pedagogy/pipeline"""
    file = form.file
    model = request.form.get('model', None)
    k_chunks = int(request.form.get('k_chunks', '3'))
    template_id = request.form.get('template_id', None)

    classroom_ctx = {
        "duration":           int(request.form.get("duration", 45)),
        "studentCount":       request.form.get("studentCount", "11-30"),
        "learning_outcome":   request.form.get("learning_outcome", ""),
        "learningSpace":      request.form.get("learningSpace", ""),
        "seatingArrangement": request.form.get("seatingArrangement", ""),
        "classroomInfra":     AIService.parse_list_field(request.form.get("classroomInfra", "")),
        "studentDevice":      AIService.parse_list_field(request.form.get("studentDevice", "")),
    }

    if not file or file.filename == '':
        def _err():
            yield sse_error("Bad Request", "No file selected.")
        return Response(stream_with_context(_err()), content_type='text/event-stream', status=400)

    file_bytes = file.read()
    if len(file_bytes) > 50 * 1024 * 1024:
        def _err():
            yield sse_error("File size exceeds 50MB limit.", "Kích thước file vượt quá giới hạn cho phép (tối đa 50MB).")
        return Response(stream_with_context(_err()), content_type='text/event-stream', status=413)

    fake_file = _FakeFile(file.filename, file_bytes)

    def _generator():
        yield from _run_streaming_pipeline(
            file=fake_file,
            model=model,
            k_chunks=k_chunks,
            template_id=template_id,
            classroom_ctx=classroom_ctx,
            lop=form.lop,
            bai_so=form.bai_so,
        )

    return Response(
        stream_with_context(_generator()),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',
            'Connection': 'keep-alive',
        },
    )
