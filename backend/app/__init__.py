"""
app/__init__.py — Khởi tạo Flask AI Layer

EDORE Python Backend — chỉ phụ trách AI & Vector DB.
Mọi thứ liên quan đến CRUD business (Templates, Scripts) đã chuyển sang Java (:8080).
"""

from flask_openapi3 import OpenAPI, Info
from flask_cors import CORS
from flask import jsonify

from app.config import Config

_info = Info(
    title="EDORE AI Layer",
    version="4.0.0",
    description=(
        "**Python AI Backend** — chỉ xử lý AI & Vector DB.\n\n"
        "**Java Backend** (`:8080`) xử lý: Templates CRUD, Script Library.\n\n"
        "## AI Pipeline\n"
        "1. `POST /api/ai/pedagogy/extract` — Trích xuất text từ file (PDF/DOCX/TXT/MD)\n"
        "2. `POST /api/ai/pedagogy/map`     — Map kiến thức → lesson nodes qua **Gemini AI**\n"
        "3. `POST /api/ai/pedagogy/enrich`  — Enrich nodes với hoạt động dạy học\n"
        "4. `POST /api/ai/pedagogy/pipeline`— Pipeline đầy đủ, stream **SSE** real-time\n\n"
        "## Qdrant Vector DB\n"
        "- `POST /api/qdrant/index`   — Index PDF SGK (Sách Giáo Khoa) vào Qdrant\n"
        "- `POST /api/qdrant/search`  — Tìm kiếm ngữ nghĩa với metadata filter\n"
        "- `GET  /api/qdrant/stats`   — Thống kê collection\n"
    )
)


def create_app(config_class=Config):
    app = OpenAPI(__name__, info=_info)
    app.config.from_object(config_class)

    # CORS configuration
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Register Modules ──────────────────────────────────────────────────────

    # Module 1: AI Pipeline (Gemini, File Extraction, SSE stream)
    from app.ai_pipeline.routes import bp as ai_bp
    app.register_api(ai_bp, url_prefix='/api/ai')

    # Module 2: Vector DB (Qdrant indexes, search)
    from app.vector_db.routes import bp as qdrant_bp
    app.register_api(qdrant_bp, url_prefix='/api/qdrant')

    @app.get('/api/health', summary="Health Check")
    def health_check():
        gemini_key = app.config.get('GEMINI_API_KEY', '')
        gemini_model = app.config.get('GEMINI_MODEL', 'gemini-3.5-flash')
        return jsonify({
            "status": "ok",
            "service": "EDORE AI Layer (Python)",
            "version": "4.0.0",
            "ai_provider": "Beeknoee Platform",
            "model": gemini_model,
            "api_key_configured": bool(gemini_key and gemini_key != 'your_beeknoee_api_key_here'),
            "endpoints": {
                "ai_pipeline":  "POST /api/ai/pedagogy/pipeline",
                "qdrant_index": "POST /api/qdrant/index",
                "swagger_ui":   "/openapi/swagger",
                "java_backend": "http://localhost:8080",
            }
        }), 200

    # ── Global Error Handlers ─────────────────────────────────────────────────
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Not Found",
            "message": "Endpoint không tồn tại. Xem Swagger tại /openapi/swagger."
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "Lỗi server nội bộ."
        }), 500

    return app
