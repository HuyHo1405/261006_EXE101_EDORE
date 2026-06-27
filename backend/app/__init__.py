from flask_openapi3 import OpenAPI, Info, Tag
from flask_cors import CORS
from flask import jsonify
from app.config import Config

# API metadata shown in Swagger UI
_info = Info(
    title="Pedagogical Architect API",
    version="3.0.0",
    description=(
        "RESTful API backend for the Expert Pedagogical Architect AI system.\n\n"
        "## Architecture\n"
        "Controller → Service → Repository (Spring Boot inspired)\n\n"
        "## Workflow Pipeline\n"
        "1. **Feature 1** `/api/ai/pedagogy/extract` — Programmatic text extraction from PDF/DOCX/TXT/MD\n"
        "2. **Feature 2** `/api/ai/pedagogy/map` — AI node mapping using OpenRouter\n"
        "3. **Feature 3** `/api/ai/pedagogy/enrich` — AI activity enrichment using OpenRouter\n"
        "4. **Pipeline (Sync)** `/api/ai/pedagogy/pipeline` — Sync pipeline (backward-compat)\n\n"
        "## Qdrant Admin\n"
        "- `POST /api/qdrant/index` — Index PDF SGK vào Qdrant\n"
        "- `DELETE /api/qdrant/document/<source>` — Xóa document\n"
        "- `GET /api/qdrant/collections` — List collections\n"
        "- `GET /api/qdrant/stats` — Collection stats\n"
        "- `POST /api/qdrant/search` — Semantic search debug\n\n"
        "Swagger UI available at `/openapi/swagger`. OpenAPI JSON at `/openapi/openapi.json`."
    )
)


def create_app(config_class=Config):
    app = OpenAPI(__name__, info=_info)
    app.config.from_object(config_class)

    # Enable CORS for all API routes
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # ── Register Controllers (HTTP layer) ─────────────────────────────────────
    from app.controllers.general_controller import bp as general_bp
    app.register_api(general_bp, url_prefix='/api')

    from app.controllers.ai_controller import bp as ai_bp
    app.register_api(ai_bp, url_prefix='/api/ai')

    from app.controllers.template_controller import bp as templates_bp
    app.register_api(templates_bp, url_prefix='/api')


    from app.controllers.qdrant_controller import bp as qdrant_bp
    app.register_api(qdrant_bp, url_prefix='/api/qdrant')

    # ── Global Error Handlers ─────────────────────────────────────────────────
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
