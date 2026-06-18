"""
stream.py — Tầng 3: SSE Streaming Route

Endpoint: POST /api/ai/pedagogy/stream

Flow:
1. Extract text từ file upload (đồng bộ, nhanh)
2. Semantic chunk text → contexts per section
3. Parallel: Gọi 3 AI completions song song (1 per node)
4. Stream từng SSE event về client khi data đến:
   - event: progress  → trạng thái tiến trình
   - event: section   → JSON của từng node khi xong
   - event: done      → kết quả tổng hợp cuối cùng
   - event: error     → lỗi nếu có

Client-side usage (JavaScript):
    const source = new EventSource('/api/ai/pedagogy/stream'); // dùng fetch với POST
    // Hoặc dùng fetch với ReadableStream vì SSE thường là GET:
    const res = await fetch('/api/ai/pedagogy/stream', { method: 'POST', body: formData });
    const reader = res.body.getReader();
"""

from flask_openapi3 import APIBlueprint, FileStorage
from flask import request, Response, stream_with_context
from pydantic import BaseModel, Field
import json
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from typing import Optional

from app.services.openrouter_service import OpenRouterService
from app.services.chunking_service import get_all_section_contexts, semantic_chunk, extract_outline
from app.routes.ai import _extract_text_from_file  # Reuse helper từ ai.py
from app.models.template_store import TemplateStore
from app.services.faithfulness_service import check_node_faithfulness

bp = APIBlueprint('stream', __name__)


# ─── Request Model ─────────────────────────────────────────────────────────────

class StreamPipelineRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, or MD file to process")


# ─── Default Template & Activities ────────────────────────────────────────────

_DEFAULT_NODE_NAMES = [
    "Khởi động",
    "Hình thành kiến thức",
    "Luyện tập",
]

_DEFAULT_NODES = [
    {"node_type": "Khởi động", "goal": "Kích hoạt kiến thức nền và tạo hứng thú cho học sinh"},
    {"node_type": "Hình thành kiến thức", "goal": "Giới thiệu, giải thích và xây dựng các khái niệm, kiến thức mới cốt lõi"},
    {"node_type": "Luyện tập", "goal": "Học sinh thực hành, làm các bài tập củng cố ngay tại lớp"},
]

_DEFAULT_SYSTEM_TEMPLATE = (
    "Khung bài học 3 node:\n"
    "Node 1 — node_type: 'Khởi động' | Mục tiêu: Kích hoạt kiến thức nền và tạo hứng thú cho học sinh\n"
    "Node 2 — node_type: 'Hình thành kiến thức' | Mục tiêu: Giới thiệu, giải thích và xây dựng các khái niệm, kiến thức mới cốt lõi\n"
    "Node 3 — node_type: 'Luyện tập' | Mục tiêu: Học sinh thực hành, làm các bài tập củng cố ngay tại lớp\n\n"
    "QUY TẮC: Trường 'title' phải là tiêu đề ngắn gọn mô tả NỘI DUNG CỤ THỂ của node này trong bài học (ĐỪNG thêm vào 'node_type')."
)

_DEFAULT_RAG_ACTIVITIES = [
    "1. Trò chơi Kahoot câu hỏi trắc nghiệm ôn tập nhanh (5-7 phút)",
    "2. Thảo luận nhóm tranh biện (Think-Pair-Share)",
    "3. Sơ đồ tư duy tiếp sức theo nhóm (Mind Map Relay)",
    "4. Nhập vai xử lý tình huống thực tế (Role Play)",
    "5. Thí nghiệm hoặc mô phỏng thực hành có hướng dẫn",
]


# ─── SSE Event Formatters ─────────────────────────────────────────────────────

def _sse_event(event_type: str, data: dict) -> str:
    """Format một SSE event string theo chuẩn EventSource."""
    return f"event: {event_type}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"


def _sse_progress(message: str, step: int, total_steps: int) -> str:
    return _sse_event("progress", {
        "message": message,
        "step": step,
        "total_steps": total_steps,
        "timestamp": time.time(),
    })


def _sse_section(node_data: dict, section_index: int) -> str:
    return _sse_event("section", {
        "index": section_index,
        "node": node_data,
        "timestamp": time.time(),
    })


def _sse_done(summary: dict) -> str:
    return _sse_event("done", {
        **summary,
        "timestamp": time.time(),
    })


def _sse_error(message: str, details: str = None) -> str:
    return _sse_event("error", {
        "message": message,
        "details": details,
        "timestamp": time.time(),
    })


def _sse_raw_data(raw_text: str) -> str:
    return _sse_event("raw_data", {
        "raw_text": raw_text,
        "timestamp": time.time(),
    })


def _sse_chunks(chunks: list) -> str:
    return _sse_event("chunks", {
        "chunks": chunks,
        "timestamp": time.time(),
    })


def _sse_mapped_nodes(mapped_nodes: list) -> str:
    return _sse_event("mapped_nodes", {
        "mapped_nodes": mapped_nodes,
        "timestamp": time.time(),
    })


def _sse_content_summary(summary: str) -> str:
    return _sse_event("content_summary", {
        "summary": summary,
        "timestamp": time.time(),
    })


# ─── Pipeline Core (generator) ────────────────────────────────────────────────

def _run_streaming_pipeline(
    file,
    model: Optional[str] = None,
    k_chunks: int = 3,
    template_id: Optional[str] = None,
    classroom_ctx: dict = None,
):
    """
    Generator function thực thi pipeline Single-Shot và yield SSE events.
    Chạy trong context của stream_with_context().
    """
    nodes = _DEFAULT_NODES
    rag_activities = _DEFAULT_RAG_ACTIVITIES

    if template_id:
        template = TemplateStore.get_by_id(template_id)
        if template:
            nodes = template["nodes"]
            if template.get("rag_activities"):
                rag_activities = template["rag_activities"]

    total_steps = 3  # Extract → Chunk → Generate Single-Shot → Done
    
    # ── Bước 1: Extract text ─────────────────────────────────────────────────
    yield _sse_progress("📄 Đang trích xuất nội dung tài liệu...", 1, total_steps)

    extracted_text, err = _extract_text_from_file(file)
    if err:
        yield _sse_error("Không thể đọc file.", err)
        return
    if not extracted_text:
        yield _sse_error("Nội dung file trống hoặc không đọc được.")
        return

    import re as _re
    extracted_text = _re.sub(r'[ \t]+', ' ', extracted_text)  # collapse spaces/tabs
    extracted_text = _re.sub(r'\n{3,}', '\n\n', extracted_text)  # collapse excessive newlines

    # Yield raw data event
    yield _sse_raw_data(extracted_text)

    # ── Phân loại tài liệu bằng Heuristics (bỏ LLM fallback) ─────────────────
    yield _sse_progress("🔍 Đang phân tích loại tài liệu...", 1, total_steps)

    text_normalized = extracted_text.lower()
    keywords = [
        "ngày soạn", "ngày dạy", "tiến trình dạy học", "thiết bị dạy học",
        "hoạt động khởi động", "hình thành kiến thức", "hoạt động luyện tập", 
        "hoạt động vận dụng", "hoạt động của gv", "hoạt động của hs",
        "chuyển giao nhiệm vụ", "dự kiến sản phẩm", "giáo án", "lesson plan",
        "tiến trình bài dạy", "tổ chức thực hiện", "sản phẩm học tập",
        "bước 1:", "bước 2:", "bước 3:", "bước 4:",
        "mục tiêu:", "nội dung:", "tổ chức hoạt động"
    ]
    match_count = sum(1 for kw in keywords if kw in text_normalized)

    doc_type = "teaching_content"
    reason = "Mặc định (Nội dung giảng dạy)"

    if match_count >= 2:
        doc_type = "pedagogical_script"
        reason = f"Phát hiện nhanh {match_count} từ khóa đặc trưng của kịch bản sư phạm/giáo án."

    yield _sse_event("doc_classification", {
        "type": doc_type,
        "reason": reason
    })

    if doc_type == "pedagogical_script":
        yield _sse_progress("Tài liệu không phù hợp — phát hiện kịch bản sư phạm.", 1, total_steps)
        yield _sse_error(
            "Tài liệu không phù hợp",
            "Hệ thống phát hiện đây là một kịch bản sư phạm hoặc giáo án đã được thiết kế sẵn. "
            "Pipeline chỉ hỗ trợ xử lý nội dung giảng dạy thô (giáo trình, tài liệu học tập, slide, bài đọc...) "
            "để tạo kịch bản bài học mới. "
            "Vui lòng tải lên tài liệu nội dung kiến thức thay vì giáo án có sẵn."
        )
        return

    # ── Bước 2: Semantic Chunking ────────────────────────────────────────────
    yield _sse_progress(
        f"✂️ Đang phân tích và chia nhỏ nội dung thành các chunks ngữ nghĩa...",
        2, total_steps
    )

    chunks = semantic_chunk(extracted_text)
    total_chunks = len(chunks)

    # Yield chunks event
    yield _sse_chunks(chunks)

    section_contexts = {}
    is_large_file = len(extracted_text) > 40000

    if is_large_file:
        section_contexts = get_all_section_contexts(
            text=extracted_text,
            nodes=nodes,
            k=k_chunks,
        )
    else:
        # Small file: use the full text as context for all sections
        for node in nodes:
            nt = node.get("node_type", "")
            section_contexts[nt] = extracted_text

    yield _sse_event("metadata", {
        "total_chars": len(extracted_text),
        "total_chunks": total_chunks,
        "sections": list(section_contexts.keys()) if is_large_file else ["Direct-Pass (Full Text)"],
        "chunks_per_section": k_chunks if is_large_file else 0,
        "is_large_file": is_large_file,
    })

    # ── Bước 3: Single-Shot LLM Call ──────────────────────────────────────────
    yield _sse_progress("⚡ AI đang tạo kịch bản bài học (Single-Shot)...", 3, total_steps)

    res = OpenRouterService.generate_single_shot_script(
        section_contexts=section_contexts,
        nodes=nodes,
        rag_activities=rag_activities,
        classroom_ctx=classroom_ctx,
        model=model,
    )

    if not res.get("success"):
        yield _sse_error(
            "Không thể tạo kịch bản bài học bằng Single-Shot.",
            res.get("error")
        )
        return

    # Parse kịch bản nodes
    content_str = res.get("content", "").strip()
    content_str = _re.sub(r'```json|```', '', content_str).strip()
    
    try:
        result_nodes = json.loads(content_str)
        if not isinstance(result_nodes, list):
            result_nodes = [result_nodes]
    except Exception as e:
        yield _sse_error("JSON Parse Error trên kết quả của AI.", f"Error details: {str(e)}\nRaw content: {content_str}")
        return

    # Post-process: Force node_type và tạo summary từ titles
    for i, node in enumerate(result_nodes):
        if i < len(nodes):
            node["node_type"] = nodes[i]["node_type"]
    
    content_summary = " — ".join(n.get("title", "Không có tiêu đề") for n in result_nodes)
    yield _sse_content_summary(content_summary)

    # Stream từng section event để frontend hiển thị lần lượt
    for i, node in enumerate(result_nodes):
        yield _sse_section(node, i)

    # ── Bước 4: Hoàn thành ────────────────────────────────────────────────────
    yield _sse_progress("✅ Hoàn thành kịch bản!", 3, total_steps)

    yield _sse_done({
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


# ─── Route ────────────────────────────────────────────────────────────────────

@bp.post(
    '/pedagogy/stream',
    summary="Stream Pipeline: Extract → Chunk → Single-Shot Gen (SSE)",
    description=(
        "**SSE Streaming Pipeline** — Upload file và nhận kết quả nhanh qua Server-Sent Events.\n\n"
        "**Event Types:**\n"
        "- `progress` — Trạng thái tiến trình\n"
        "- `metadata` — Thông tin chunks (số chunks, sections)\n"
        "- `section` — JSON của từng node khi hoàn thành\n"
        "- `done` — Kết quả tổng hợp cuối cùng\n"
        "- `error` — Lỗi nghiêm trọng làm dừng pipeline\n\n"
        "**Content-Type**: `text/event-stream`"
    )
)
def stream_pipeline(form: StreamPipelineRequest):
    """POST /api/ai/pedagogy/stream"""
    file = form.file
    model = request.form.get('model', None)
    k_chunks = int(request.form.get('k_chunks', '3'))
    template_id = request.form.get('template_id', None)

    # Đọc classroom_ctx gửi lên từ client — bao gồm tất cả fields từ ClassroomConfigModal
    infra_raw = request.form.get("classroomInfra", "")
    device_raw = request.form.get("studentDevice", "")

    def parse_list_field(raw_val):
        if not raw_val:
            return []
        raw_val = raw_val.strip()
        if raw_val.startswith("[") and raw_val.endswith("]"):
            try:
                return json.loads(raw_val)
            except Exception:
                pass
        return [item.strip() for item in raw_val.split(",") if item.strip()]

    classroom_ctx = {
        "duration": int(request.form.get("duration", 45)),
        "studentCount": request.form.get("studentCount", "11-30"),
        "learning_outcome": request.form.get("learning_outcome", ""),
        "learningSpace": request.form.get("learningSpace", ""),
        "seatingArrangement": request.form.get("seatingArrangement", ""),
        "classroomInfra": parse_list_field(infra_raw),
        "studentDevice": parse_list_field(device_raw),
    }

    if not file or file.filename == '':
        def _error_gen():
            yield _sse_error("Bad Request", "No file selected.")
        return Response(
            stream_with_context(_error_gen()),
            content_type='text/event-stream',
            status=400,
        )

    # Đọc file bytes TRƯỚC khi vào generator (file object không thread-safe)
    file_bytes = file.read()
    
    MAX_FILE_SIZE = 50 * 1024 * 1024  # 50MB
    if len(file_bytes) > MAX_FILE_SIZE:
        def _error_gen():
            yield _sse_error("File size exceeds 50MB limit.", "Kích thước file vượt quá giới hạn cho phép (tối đa 50MB).")
        return Response(
            stream_with_context(_error_gen()),
            content_type='text/event-stream',
            status=413,
        )

    file_name = file.filename

    # Tạo fake file object để pass vào _extract_text_from_file
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

    fake_file = _FakeFile(file_name, file_bytes)

    def _generator():
        yield from _run_streaming_pipeline(
            file=fake_file,
            model=model,
            k_chunks=k_chunks,
            template_id=template_id,
            classroom_ctx=classroom_ctx,
        )

    return Response(
        stream_with_context(_generator()),
        content_type='text/event-stream',
        headers={
            'Cache-Control': 'no-cache',
            'X-Accel-Buffering': 'no',  # Disable Nginx buffering
            'Connection': 'keep-alive',
        },
    )
