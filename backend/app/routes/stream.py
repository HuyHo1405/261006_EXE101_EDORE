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
from app.services.chunking_service import get_all_section_contexts, semantic_chunk
from app.routes.ai import _extract_text_from_file  # Reuse helper từ ai.py

bp = APIBlueprint('stream', __name__)


# ─── Request Model ─────────────────────────────────────────────────────────────

class StreamPipelineRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF, TXT, or MD file to process")


# ─── Default Template & Activities ────────────────────────────────────────────

_DEFAULT_NODE_NAMES = [
    "Khởi động (Warm-up)",
    "Lý thuyết cốt lõi (Core Theory)",
    "Thực hành & Vận dụng (Practice)",
]

_DEFAULT_SYSTEM_TEMPLATE = (
    "Khung bài học 3 phần:\n"
    "Node 1: Khởi động (Warm-up) - Kích hoạt kiến thức nền của học sinh\n"
    "Node 2: Lý thuyết cốt lõi (Core Theory) - Giới thiệu và giải thích nội dung chính\n"
    "Node 3: Thực hành & Vận dụng (Practice) - Học sinh áp dụng kiến thức vào bài tập"
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


# ─── Pipeline Core (generator) ────────────────────────────────────────────────

def _run_streaming_pipeline(
    file,
    model: Optional[str] = None,
    enable_faithfulness: bool = False,
    k_chunks: int = 5,
):
    """
    Generator function thực thi pipeline và yield SSE events.
    Chạy trong context của stream_with_context().
    """
    total_steps = 5  # Extract → Chunk → Map → Parallel Enrich → Done

    # ── Bước 1: Extract text ─────────────────────────────────────────────────
    yield _sse_progress("📄 Đang trích xuất nội dung tài liệu...", 1, total_steps)

    extracted_text, err = _extract_text_from_file(file)
    if err:
        yield _sse_error("Không thể đọc file.", err)
        return
    if not extracted_text:
        yield _sse_error("Nội dung file trống hoặc không đọc được.")
        return

    # ── Bước 2: Semantic Chunking ────────────────────────────────────────────
    yield _sse_progress(
        f"✂️ Đang phân tích và chia nhỏ nội dung thành các chunks ngữ nghĩa...",
        2, total_steps
    )

    chunks = semantic_chunk(extracted_text)
    total_chunks = len(chunks)

    section_contexts = get_all_section_contexts(
        text=extracted_text,
        node_names=_DEFAULT_NODE_NAMES,
        k=k_chunks,
    )

    yield _sse_event("metadata", {
        "total_chars": len(extracted_text),
        "total_chunks": total_chunks,
        "sections": list(section_contexts.keys()),
        "chunks_per_section": k_chunks,
    })

    # ── Bước 3: Map knowledge với section contexts ────────────────────────────
    yield _sse_progress("🗺️ AI đang ánh xạ kiến thức vào template bài học...", 3, total_steps)

    map_result = OpenRouterService.map_knowledge_to_template(
        extracted_knowledge=extracted_text,
        system_template=_DEFAULT_SYSTEM_TEMPLATE,
        model=model,
        temperature=0.3,
        use_chunking=True,
        section_contexts=section_contexts,
    )

    if not map_result.get("success"):
        yield _sse_error(
            "Không thể ánh xạ kiến thức vào template.",
            map_result.get("error")
        )
        return

    # Parse mapped nodes
    mapped_content = map_result.get("content", "").strip()
    import re
    mapped_content_clean = re.sub(r'```json|```', '', mapped_content).strip()
    try:
        import json as _json
        mapped_nodes = _json.loads(mapped_content_clean)
        if not isinstance(mapped_nodes, list):
            mapped_nodes = [mapped_nodes]
    except Exception:
        mapped_nodes = [{"node_name": "Bài học", "_raw": mapped_content}]

    # ── Bước 4: Parallel Enrich ───────────────────────────────────────────────
    yield _sse_progress(
        f"⚡ Đang tạo hoạt động dạy học song song cho {len(mapped_nodes)} nodes...",
        4, total_steps
    )

    # Build section_contexts keyed by node_name từ mapped_nodes
    node_contexts = {}
    for node in mapped_nodes:
        if isinstance(node, dict):
            node_name = node.get("node_name", "")
            # Tìm context phù hợp từ section_contexts
            for ctx_name, ctx_text in section_contexts.items():
                if any(kw in node_name.lower() for kw in ctx_name.lower().split()):
                    node_contexts[node_name] = ctx_text
                    break
            if node_name not in node_contexts:
                # Fallback: lấy context đầu tiên
                node_contexts[node_name] = next(iter(section_contexts.values()), "")

    enriched_nodes = []
    errors = []

    # Capture app instance before entering thread execution
    from flask import current_app
    app = current_app._get_current_object()

    def _enrich_task_with_index(index: int, node, app_obj):
        """Thread task: enrich 1 node, trả về (index, result)."""
        with app_obj.app_context():
            node_name = node.get("node_name", "") if isinstance(node, dict) else ""
            context = node_contexts.get(node_name, "")
            result = OpenRouterService.enrich_single_node(
                node=node,
                rag_activities=_DEFAULT_RAG_ACTIVITIES,
                model=model,
                temperature=0.5,
                section_context=context,
            )
            return index, result

    with ThreadPoolExecutor(max_workers=min(3, len(mapped_nodes))) as executor:
        futures = {
            executor.submit(_enrich_task_with_index, i, node, app): i
            for i, node in enumerate(mapped_nodes)
        }

        finished_nodes = [None] * len(mapped_nodes)

        for future in as_completed(futures):
            try:
                index, result = future.result()
                if result.get("success"):
                    content_str = result.get("content", "").strip()
                    content_str = re.sub(r'```json|```', '', content_str).strip()
                    try:
                        parsed_node = json.loads(content_str)
                    except json.JSONDecodeError:
                        parsed_node = {"_raw": content_str}

                    finished_nodes[index] = parsed_node

                    # Stream section event ngay khi node xong
                    yield _sse_section(parsed_node, index)

                else:
                    error_msg = f"Node {index}: {result.get('error', 'Unknown error')}"
                    errors.append(error_msg)
                    yield _sse_event("node_error", {
                        "index": index,
                        "error": error_msg,
                    })

            except Exception as e:
                idx = futures[future]
                error_msg = f"Node {idx}: Thread exception — {str(e)}"
                errors.append(error_msg)
                yield _sse_event("node_error", {"index": idx, "error": error_msg})

    enriched_nodes = [n for n in finished_nodes if n is not None]

    # ── Bước 5: Done ─────────────────────────────────────────────────────────
    yield _sse_progress("✅ Hoàn thành! Đang tổng hợp kết quả...", 5, total_steps)

    yield _sse_done({
        "success": True,
        "stats": {
            "total_chars_extracted": len(extracted_text),
            "total_chunks": total_chunks,
            "nodes_mapped": len(mapped_nodes),
            "nodes_enriched": len(enriched_nodes),
            "errors": errors,
        },
        "raw_extracted_text": extracted_text[:500] + "..." if len(extracted_text) > 500 else extracted_text,
        "mapped_nodes": mapped_nodes,
        "final_pedagogical_script": enriched_nodes,
    })


# ─── Route ────────────────────────────────────────────────────────────────────

@bp.post(
    '/pedagogy/stream',
    summary="Stream Pipeline: Extract → Chunk → Map → Parallel Enrich (SSE)",
    description=(
        "**SSE Streaming Pipeline** — Upload file và nhận kết quả theo thời gian thực qua Server-Sent Events.\n\n"
        "**Event Types:**\n"
        "- `progress` — Trạng thái tiến trình\n"
        "- `metadata` — Thông tin chunks (số chunks, sections)\n"
        "- `section` — JSON của từng node khi hoàn thành (stream ngay, không cần đợi tất cả)\n"
        "- `node_error` — Lỗi của từng node riêng lẻ\n"
        "- `done` — Kết quả tổng hợp cuối cùng\n"
        "- `error` — Lỗi nghiêm trọng làm dừng pipeline\n\n"
        "**Content-Type**: `text/event-stream`\n\n"
        "**Improvements over /pedagogy/pipeline:**\n"
        "- Semantic chunking (không dump toàn bộ text vào 1 prompt)\n"
        "- JSON Schema enforcement (giảm hallucination)\n"
        "- Parallel node enrichment (tốc độ gần bằng 1 node thay vì 3 node tuần tự)\n"
        "- Real-time streaming (UX không bao giờ thấy màn hình trắng)"
    )
)
def stream_pipeline(form: StreamPipelineRequest):
    """POST /api/ai/pedagogy/stream"""
    file = form.file
    model = request.form.get('model', None)
    enable_faithfulness = request.form.get('enable_faithfulness', 'false').lower() == 'true'
    k_chunks = int(request.form.get('k_chunks', '3'))  # Mặc định 3 thay vì 5 — giảm context size, tránh timeout

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
    file_name = file.filename

    # Tạo fake file object để pass vào _extract_text_from_file
    import io

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

    fake_file = _FakeFile(file_name, file_bytes)

    def _generator():
        yield from _run_streaming_pipeline(
            file=fake_file,
            model=model,
            enable_faithfulness=enable_faithfulness,
            k_chunks=k_chunks,
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
