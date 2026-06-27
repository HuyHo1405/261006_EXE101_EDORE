"""
qdrant_controller.py — HTTP layer cho Qdrant Admin API.

Endpoints:
    POST   /api/qdrant/index                  — Upload PDF → index vào Qdrant
    DELETE /api/qdrant/document/<source_name> — Xóa document theo source
    GET    /api/qdrant/collections            — List collections
    GET    /api/qdrant/stats                  — Collection stats
    POST   /api/qdrant/search                 — Semantic search với filter
"""

from flask_openapi3 import APIBlueprint, FileStorage
from flask import jsonify
from pydantic import BaseModel, Field
from typing import Optional

from app.services.qdrant_service import QdrantService

bp = APIBlueprint('qdrant', __name__)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class IndexRequest(BaseModel):
    file: FileStorage = Field(..., description="PDF file để index vào Qdrant")
    source: Optional[str] = Field(None, description="Tên định danh document (vd: sgk_ls_6). Nếu trống, tự động sinh từ tên file.")
    lop: Optional[int] = Field(0, description="Lớp học (6, 7, 8, ...). Dùng để filter khi search.")
    collection: Optional[str] = Field(None, description="Tên Qdrant collection (mặc định từ config)")
    grade: Optional[str] = Field(None, description="Lớp học dạng text (deprecated, dùng lop)")
    subject: Optional[str] = Field(None, description="Môn học (optional)")


class SourcePath(BaseModel):
    source_name: str = Field(..., description="Tên source (định danh document) để xóa")


class SearchRequest(BaseModel):
    query: str = Field(..., description="Câu truy vấn tìm kiếm tiếng Việt")
    top_k: Optional[int] = Field(5, description="Số kết quả trả về (mặc định: 5)")
    source_filter: Optional[str] = Field(None, description="Chỉ search trong document này")
    collection: Optional[str] = Field(None, description="Tên collection (mặc định từ config)")
    lop: Optional[int] = Field(None, description="Lọc theo lớp học (6, 7, 8, ...)")
    bai_so: Optional[int] = Field(None, description="Lọc theo số bài cụ thể (1, 2, 3, ...)")
    loai: Optional[str] = Field(None, description="Lọc theo loại chunk: kien_thuc_chinh | cau_hoi | vi_du | luyen_tap | loi_dan")


# ─── Routes ───────────────────────────────────────────────────────────────────

@bp.post(
    '/index',
    summary="Index PDF SGK vào Qdrant",
    description=(
        "Upload PDF SGK Lịch Sử → trích xuất text → parse cấu trúc Bài/Mục/Loại → embed → upsert vào Qdrant.\n\n"
        "Mỗi chunk được gắn metadata: `lop`, `bai_so`, `ten_bai`, `muc`, `ten_muc`, `loai`, `tu_khoa`.\n\n"
        "⚠️ **Lần đầu chạy**: Model embedding (~120MB) và OCR (~100MB) sẽ tự động tải về máy."
    )
)
def index_document(form: IndexRequest):
    """POST /api/qdrant/index"""
    file = form.file
    if not file or file.filename == '':
        return jsonify({"error": "Bad Request", "message": "No file selected."}), 400

    # Tự động sinh source từ tên file nếu không được truyền
    source_name = form.source.strip() if form.source else ""
    if not source_name:
        import re
        base_name = file.filename.rsplit('.', 1)[0]
        source_name = re.sub(r'[^a-zA-Z0-9_\-]', '_', base_name).strip('_') or "document"

    lop = form.lop or 0
    collection = form.collection

    # Metadata bổ sung
    metadata = {}
    if form.subject:
        metadata['subject'] = form.subject.strip()

    try:
        result = QdrantService.index_pdf(
            file=file,
            source_name=source_name,
            lop=lop,
            collection=collection,
            metadata=metadata,
        )
        if result.get("success"):
            return jsonify(result), 200
        return jsonify(result), 500
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp.delete(
    '/document/<string:source_name>',
    summary="Xóa document khỏi Qdrant",
    description="Xóa tất cả chunks của một document theo `source_name`."
)
def delete_document(path: SourcePath):
    """DELETE /api/qdrant/document/<source_name>"""
    from flask import request
    collection = request.args.get('collection', None)
    try:
        result = QdrantService.delete_document(path.source_name, collection)
        return jsonify(result), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500


@bp.get(
    '/collections',
    summary="List Qdrant collections",
    description="Trả về danh sách tất cả collections trong Qdrant instance."
)
def list_collections():
    """GET /api/qdrant/collections"""
    try:
        collections = QdrantService.list_collections()
        return jsonify({"collections": collections}), 200
    except Exception as e:
        return jsonify({"error": str(e), "hint": "Hãy đảm bảo Qdrant đang chạy: docker compose up"}), 503


@bp.get(
    '/stats',
    summary="Qdrant collection stats",
    description="Trả về thông tin chi tiết của collection (số điểm, vector size, status)."
)
def get_stats():
    """GET /api/qdrant/stats"""
    from flask import request, current_app
    collection = request.args.get('collection', None)
    try:
        info = QdrantService.get_collection_info(collection)
        if info is None:
            col = collection or current_app.config.get('QDRANT_COLLECTION', 'history_textbook')
            return jsonify({"error": "Not Found", "message": f"Collection '{col}' không tồn tại hoặc chưa được tạo."}), 404
        return jsonify(info), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 503


@bp.post(
    '/search',
    summary="Semantic Search với Filter",
    description=(
        "Tìm kiếm ngữ nghĩa trong Qdrant có hỗ trợ filter metadata chính xác.\n\n"
        "**Ví dụ filter chính xác:**\n"
        "```json\n"
        "{ \"query\": \"nguồn sử liệu là gì\", \"lop\": 6, \"bai_so\": 1, \"loai\": \"kien_thuc_chinh\" }\n"
        "```\n\n"
        "**Các giá trị `loai`:** `kien_thuc_chinh` | `cau_hoi` | `vi_du` | `luyen_tap` | `loi_dan`"
    )
)
def search_documents(body: SearchRequest):
    """POST /api/qdrant/search"""
    if not body.query or not body.query.strip():
        return jsonify({"error": "Bad Request", "message": "'query' is required."}), 400

    try:
        results = QdrantService.search(
            query=body.query,
            collection=body.collection,
            top_k=body.top_k or 5,
            source_filter=body.source_filter,
            lop=body.lop,
            bai_so=body.bai_so,
            loai=body.loai,
        )
        return jsonify({
            "query": body.query,
            "filters": {
                "lop": body.lop,
                "bai_so": body.bai_so,
                "loai": body.loai,
                "source": body.source_filter,
            },
            "results": results,
            "count": len(results),
        }), 200
    except Exception as e:
        return jsonify({"success": False, "error": str(e)}), 500
