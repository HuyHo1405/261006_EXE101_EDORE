"""
routes.py — HTTP layer cho AI Pedagogy Pipeline.

Nhận các request từ frontend, gọi file_extractor và gemini_client,
và trả kết quả về dạng JSON hoặc EventStream (SSE).
"""

import json
import re as _re
import time
from flask_openapi3 import APIBlueprint, FileStorage
from flask import request, jsonify, current_app, Response, stream_with_context
from pydantic import BaseModel, Field
from typing import Optional, Any

from app.ai_pipeline.file_extractor import (
    AIService,
    sse_event, sse_progress, sse_section, sse_done, sse_error,
    sse_content_summary, sse_chunks,
    DEFAULT_RAG_ACTIVITIES,
)
from app.ai_pipeline.gemini_client import GeminiService
from app.ai_pipeline.chunker import get_all_section_contexts, semantic_chunk, extract_outline, extract_key_facts

bp = APIBlueprint('ai', __name__)


# ─── Pydantic Request Schemas ─────────────────────────────────────────────────

class ChatRequest(BaseModel):
    system_prompt: Optional[str] = Field(None, description="System instructions/persona for the AI model.", example="You are a helpful programming assistant.")
    user_prompt: Optional[str] = Field(None, description="The user query or question.", example="How do I read a JSON file in Python?")
    messages: Optional[list] = Field(None, description="Alternative: Full message history list (role/content pairs).")
    model: Optional[str] = Field(None, description="Optional Beeknoee model override.")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature.")
    max_tokens: Optional[int] = Field(1000, description="Maximum tokens to generate.")


class MapRequest(BaseModel):
    extracted_knowledge: str = Field(..., description="Raw text extracted from source document.")
    system_template: str = Field(..., description="Lesson node template string.")
    model: Optional[str] = Field(None, description="Optional Gemini model override.")
    temperature: Optional[float] = Field(0.3, description="Sampling temperature.")
    lop: Optional[int] = Field(None, description="Grade level (optional for RAG validation)")
    bai_so: Optional[int] = Field(None, description="Lesson number (optional for RAG validation)")

    # Validator to handle string "null" sent by frontend
    @classmethod
    def model_validate(cls, obj: Any, *args, **kwargs):
        if isinstance(obj, dict):
            for field in ['lop', 'bai_so']:
                if obj.get(field) == "null" or obj.get(field) == "":
                    obj[field] = None
        return super().model_validate(obj, *args, **kwargs)



class EnrichRequest(BaseModel):
    mapped_nodes: object = Field(..., description="Mapped node array or JSON string.")
    rag_activities: Optional[object] = Field(None, description="List of teaching methodology strings.")
    classroom_ctx: Optional[dict] = Field(None, description="Optional classroom context configuration.")
    model: Optional[str] = Field(None, description="Optional Gemini model override.")
    temperature: Optional[float] = Field(0.5, description="Sampling temperature.")


class ExtractRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, DOCX, or MD file to extract text from")


class StreamPipelineRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, DOCX, or MD file to process")
    lop: Optional[int] = Field(None, description="Grade level (optional for RAG validation)")
    bai_so: Optional[int] = Field(None, description="Lesson number (optional for RAG validation)")


# ─── FakeFile Helper for SSE ──────────────────────────────────────────────────

class _FakeFile:
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


# ─── Streaming Pipeline ───────────────────────────────────────────────────────

def _run_streaming_pipeline(file, model, k_chunks, template_id, classroom_ctx, lop=None, bai_so=None):
    total_steps = 3
    pipeline_start = time.time()

    # 2. Hỗ trợ động template_id (3 node vs 4 node)
    if template_id == 'extended-4-node':
        nodes = [
            {"node_type": "Khởi động",          "goal": "Kích hoạt kiến thức nền và tạo hứng thú cho học sinh"},
            {"node_type": "Hình thành kiến thức", "goal": "Giới thiệu, giải thích và xây dựng các khái niệm, kiến thức mới cốt lõi"},
            {"node_type": "Luyện tập",            "goal": "Học sinh thực hành, làm các bài tập củng cố ngay tại lớp"},
            {"node_type": "Vận dụng",            "goal": "Phát triển năng lực thực hành giải quyết vấn đề thực tế và mở rộng sáng tạo"},
        ]
    else:
        nodes = [
            {"node_type": "Khởi động",          "goal": "Kích hoạt kiến thức nền và tạo hứng thú cho học sinh"},
            {"node_type": "Hình thành kiến thức", "goal": "Giới thiệu, giải thích và xây dựng các khái niệm, kiến thức mới cốt lõi"},
            {"node_type": "Luyện tập",            "goal": "Học sinh thực hành, làm các bài tập củng cố ngay tại lớp"},
        ]
    rag_activities = DEFAULT_RAG_ACTIVITIES

    yield sse_progress("📄 Đang trích xuất nội dung từ file...", 1, total_steps)
    start_extract = time.time()
    extracted_text, err = AIService.extract_text_from_file(file)
    extract_duration = time.time() - start_extract

    if err or not extracted_text:
        yield sse_error(err or f"Không trích xuất được nội dung từ file. (Thời gian: {extract_duration:.2f}s)", None)
        return

    yield sse_progress(f"✂️ Đang chia nhỏ nội dung thành các chunks... (Trích xuất file xong trong {extract_duration:.2f}s)", 2, total_steps)
    start_chunk = time.time()
    chunks = semantic_chunk(extracted_text)
    chunk_duration = time.time() - start_chunk
    total_chunks = len(chunks)
    yield sse_chunks(chunks)

    # 1. Trích xuất Key Facts Anchor
    key_facts_anchor = extract_key_facts(extracted_text)

    # 3. Tăng/đồng bộ k_chunks hoặc làm thích ứng
    if k_chunks is None or k_chunks == 0:
        k_chunks = min(8, max(3, total_chunks // len(nodes) + 1))
        print(f"[Pipeline] Computed dynamic k_chunks: {k_chunks}")

    section_contexts = {}
    # 5. Đồng bộ hành vi file lớn/nhỏ (nâng ngưỡng lên 60000)
    is_large_file = len(extracted_text) > 60000

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

    # Log context sizes (Priority 7)
    for nt, ctx in section_contexts.items():
        print(f"[Pipeline] Context size for node '{nt}': {len(ctx)} chars")

    yield sse_event("metadata", {
        "total_chars": len(extracted_text),
        "total_chunks": total_chunks,
        "sections": list(section_contexts.keys()) if is_large_file else ["Direct-Pass (Full Text)"],
        "chunks_per_section": k_chunks if is_large_file else 0,
        "is_large_file": is_large_file,
        "durations": {
            "extract_seconds": round(extract_duration, 2),
            "chunk_seconds": round(chunk_duration, 2)
        }
    })

    yield sse_progress(f"⚡ AI đang tạo kịch bản bài học (Single-Shot)... (Chia chunk xong trong {chunk_duration:.2f}s)", 3, total_steps)
    start_ai = time.time()
    res = GeminiService.generate_single_shot_script(
        section_contexts=section_contexts,
        nodes=nodes,
        rag_activities=rag_activities,
        classroom_ctx=classroom_ctx,
        model=model,
        key_facts_anchor=key_facts_anchor,
    )
    ai_duration = time.time() - start_ai

    if not res.get("success"):
        yield sse_error(f"Không thể tạo kịch bản bài học bằng Single-Shot. (Thời gian AI: {ai_duration:.2f}s)", res.get("error"))
        return

    content_str = res.get("content", "").strip()
    content_str = _re.sub(r'```json|```', '', content_str).strip()

    try:
        result_nodes = json.loads(content_str)
        if not isinstance(result_nodes, list):
            result_nodes = [result_nodes]
    except Exception as e:
        yield sse_error("JSON Parse Error trên kết quả của AI.", f"Error: {str(e)}\nRaw: {content_str}")
        return

    for i, node in enumerate(result_nodes):
        if i < len(nodes):
            node["node_type"] = nodes[i]["node_type"]

    content_summary = " — ".join(n.get("title", "Không có tiêu đề") for n in result_nodes)
    yield sse_content_summary(content_summary)

    for i, node in enumerate(result_nodes):
        yield sse_section(node, i)

    total_duration = time.time() - pipeline_start
    print("\n" + "="*40)
    print("      PIPELINE EXECUTION COMPLETE LOG")
    print("="*40)
    print(f"extract_seconds: {extract_duration:.2f}")
    print(f"chunk_seconds:   {chunk_duration:.2f}")
    print(f"ai_seconds:      {ai_duration:.2f}")
    print(f"total_seconds:   {total_duration:.2f}")
    print("="*40 + "\n")

    yield sse_progress(f"✅ Hoàn thành kịch bản! (Tổng thời gian: {total_duration:.2f}s)", 3, total_steps)
    yield sse_done({
        "success": True,
        "content_summary": content_summary,
        "stats": {
            "total_chars_extracted": len(extracted_text),
            "total_chunks": total_chunks,
            "nodes_mapped": len(nodes),
            "nodes_enriched": len(result_nodes),
            "errors": [],
            "durations": {
                "extract_seconds": round(extract_duration, 2),
                "chunk_seconds": round(chunk_duration, 2),
                "ai_seconds": round(ai_duration, 2),
                "total_seconds": round(total_duration, 2)
            }
        },
        "raw_extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
        "mapped_nodes": result_nodes,
        "final_pedagogical_script": result_nodes,
    })


# ─── Routes ───────────────────────────────────────────────────────────────────

@bp.post('/chat', summary="Trò chuyện với AI Gemini")
def chat(body: ChatRequest):
    """POST /api/ai/chat"""
    system_prompt = body.system_prompt
    user_prompt = body.user_prompt
    messages = body.messages
    model = body.model
    temperature = body.temperature if body.temperature is not None else 0.7
    max_tokens = body.max_tokens if body.max_tokens is not None else 1000

    if not system_prompt and not user_prompt and not messages:
        return jsonify({"error": "Bad Request", "message": "Either ('system_prompt'/'user_prompt') or 'messages' must be provided."}), 400
    
    if not messages:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if user_prompt:
            messages.append({"role": "user", "content": user_prompt})
    elif not isinstance(messages, list):
        return jsonify({"error": "Bad Request", "message": "'messages' must be a JSON array."}), 400


    result = GeminiService.generate_chat_completion(
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
        return jsonify({"success": False, "error": result.get("error", "Unknown error")}), 500


@bp.post('/pedagogy/extract', summary="Trích xuất text từ file (Không qua AI)")
def extract_pedagogy(form: ExtractRequest):
    """POST /api/ai/pedagogy/extract"""
    file = form.file
    if not file or file.filename == '':
        return jsonify({"error": "Bad Request", "message": "No selected file."}), 400

    # Kiểm tra kích thước file (Giới hạn dưới 150KB)
    file.seek(0, 2)
    file_size = file.tell()
    file.seek(0)
    if file_size > 150 * 1024:
        return jsonify({"success": False, "error": "Kích thước file vượt quá giới hạn cho phép (tối đa 150KB)."}), 400

    text, err = AIService.extract_text_from_file(file)
    if err:
        status = 415 if "Only PDF" in err else 500
        return jsonify({"success": False, "error": err}), status

    return jsonify({"success": True, "filename": file.filename, "extracted_text": text}), 200


@bp.post('/pedagogy/map', summary="AI Mapping kiến thức → Lesson Nodes")
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
    key_facts = extract_key_facts(extracted_knowledge)
    sgk_context = ""
    cross_verification_rule = ""


    system_prompt = (
        "You are an Expert Pedagogical Architect AI.\n"
        "Your task is to map the provided key concepts into a pre-defined lesson template.\n\n"
        "CRITICAL RULES:\n"
        "1. Use ONLY information from the provided text. Hallucination is forbidden.\n"
        "2. Preserve 100% of all original timestamps, dates, figures, and proper names.\n"
        "3. Respond ONLY with a valid JSON array. No markdown, no extra text.\n"
        "4. Format 'node_content' using Markdown: '###' for headings, '-' for lists, '**text**' for bold.\n"
        f"{cross_verification_rule}"
    )

    user_content = (
        f"STANDARD TEXTBOOK CONTENT (SGK Lớp {lop} Bài {bai_so}):\n{sgk_context}\n\n" if sgk_context else ""
    )
    if key_facts:
        user_content += f"{key_facts}\n\n"
    if outline:
        user_content += f"DOCUMENT OUTLINE:\n{outline}\n\n"
    user_content += (
        f"EXTRACTED KNOWLEDGE:\n{extracted_knowledge[:100000]}\n\n"
        f"LESSON TEMPLATE:\n{system_template}"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    result = GeminiService.generate_chat_completion(
        messages=messages,
        model=model,
        temperature=temperature,
        max_tokens=2000
    )
    if result.get("success"):
        return jsonify({"success": True, "mapped_nodes": result.get("content")}), 200
    return jsonify({"success": False, "error": result.get("error")}), 500


@bp.post('/pedagogy/enrich', summary="AI Hoạt động dạy học Enrichment")
def enrich_pedagogy(body: EnrichRequest):
    """POST /api/ai/pedagogy/enrich"""
    mapped_nodes = body.mapped_nodes
    rag_activities = body.rag_activities
    classroom_ctx = body.classroom_ctx
    model = body.model
    temperature = body.temperature if body.temperature is not None else 0.5

    if not mapped_nodes:
        return jsonify({"error": "Bad Request", "message": "'mapped_nodes' is required."}), 400
    
    nodes_str = json.dumps(mapped_nodes, ensure_ascii=False) if isinstance(mapped_nodes, (list, dict)) else str(mapped_nodes)
    activities_str = json.dumps(rag_activities, ensure_ascii=False) if isinstance(rag_activities, (list, dict)) else str(rag_activities)

    system_prompt = (
        "You are an Expert Pedagogical Architect AI.\n"
        "For every mapped node, select and adapt the most sensible activity from the provided list.\n\n"
        "CRITICAL RULES:\n"
        "1. Use ONLY activities from the provided list.\n"
        "2. Keep and pass through the 'node_content' array from each input node exactly.\n"
        "3. Keep the exact 'node_type' of each input node. Do NOT change them.\n"
        "4. Respond ONLY with a valid JSON array of objects. No markdown, no extra text."
    )

    user_content = (
        f"MAPPED NODES:\n{nodes_str}\n\n"
        f"AVAILABLE TEACHING ACTIVITIES:\n{activities_str}\n\n"
        "For each node, select the most appropriate activity and return the full enriched JSON array."
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content}
    ]

    result = GeminiService.generate_chat_completion(
        messages=messages,
        model=model,
        temperature=temperature,
        max_tokens=3000
    )
    if result.get("success"):
        return jsonify({"success": True, "enriched_script": result.get("content")}), 200
    return jsonify({"success": False, "error": result.get("error")}), 500



@bp.post('/pedagogy/pipeline', summary="Chạy toàn bộ pipeline (SSE Stream)")
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
    if len(file_bytes) > 150 * 1024:
        def _err_size():
            yield sse_error("Bad Request", "Kích thước file vượt quá giới hạn cho phép (tối đa 150KB).")
        return Response(stream_with_context(_err_size()), content_type='text/event-stream', status=400)

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
