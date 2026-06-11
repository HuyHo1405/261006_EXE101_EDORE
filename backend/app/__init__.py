from flask_openapi3 import OpenAPI, Info, Tag
from flask_cors import CORS
from flask import jsonify
from app.config import Config

# API metadata shown in Swagger UI
_info = Info(
    title="Pedagogical Architect API",
    version="2.0.0",
    description=(
        "RESTful API backend for the Expert Pedagogical Architect AI system.\n\n"
        "## Workflow Pipeline\n"
        "1. **Feature 1** `/api/ai/pedagogy/extract` — Programmatic text extraction from PDF/TXT/MD (no AI)\n"
        "2. **Feature 2** `/api/ai/pedagogy/map` — AI node mapping using OpenRouter\n"
        "3. **Feature 3** `/api/ai/pedagogy/enrich` — AI activity enrichment using OpenRouter\n"
        "4. **Pipeline (Sync)** `/api/ai/pedagogy/pipeline` — Runs all 3 phases automatically (legacy, backward-compat)\n"
        "5. \u26a1 **Pipeline (Stream)** `/api/ai/pedagogy/stream` — **NEW**: SSE streaming with semantic chunking + parallel enrichment\n\n"
        "## New in v2.0\n"
        "✔️ **Semantic Chunking** — Tài liệu được chia theo ranh giới ngữ nghĩa, không dump toàn bộ vào 1 prompt\n"
        "✔️ **JSON Schema Enforcement** — AI bị ép điền đúng schema, giảm hallucination\n"
        "✔️ **SSE Streaming** — User thấy kết quả theo thời gian thực, không cần đợi toàn bộ pipeline\n"
        "✔️ **Parallel Enrichment** — 3 AI calls song song thay vì tuần tự\n\n"
        "Swagger UI available at `/openapi/swagger`. OpenAPI JSON at `/openapi/openapi.json`."
    )
)

def create_app(config_class=Config):
    app = OpenAPI(__name__, info=_info)
    app.config.from_object(config_class)

    # Enable CORS for all API routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Register blueprints
    from app.routes.general import bp as general_bp
    app.register_api(general_bp, url_prefix='/api')

    from app.routes.ai import bp as ai_bp
    app.register_api(ai_bp, url_prefix='/api/ai')

    from app.routes.stream import bp as stream_bp
    app.register_api(stream_bp, url_prefix='/api/ai')

    # Global error handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({
            "error": "Not Found",
            "message": "The requested resource could not be found."
        }), 404

    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({
            "error": "Internal Server Error",
            "message": "An unexpected error occurred on the server."
        }), 500

    return app
