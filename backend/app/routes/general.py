from flask_openapi3 import APIBlueprint
from flask import jsonify
from pydantic import BaseModel

bp = APIBlueprint('general', __name__)

class HealthResponse(BaseModel):
    status: str
    service: str
    version: str

@bp.get('/health', summary="Health Check", responses={"200": HealthResponse})
def health_check():
    """
    Returns the health status of the API service.
    """
    return jsonify({
        "status": "healthy",
        "service": "Pedagogical Architect API",
        "version": "1.0.0"
    }), 200
