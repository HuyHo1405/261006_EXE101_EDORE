"""
general_controller.py — Health check endpoint.
"""

from flask_openapi3 import APIBlueprint
from flask import jsonify

bp = APIBlueprint('general', __name__)


@bp.get('/health', summary="Health Check", description="Kiểm tra server đang chạy.")
def health_check():
    """GET /api/health"""
    return jsonify({"status": "ok", "service": "Pedagogical Architect API"}), 200
