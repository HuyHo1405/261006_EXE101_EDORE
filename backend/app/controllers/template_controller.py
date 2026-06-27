"""
template_controller.py — HTTP layer cho CRUD LessonTemplate.

Gọi qua TemplateRepository, không chứa business logic.
"""

from flask_openapi3 import APIBlueprint
from flask import jsonify
from pydantic import BaseModel, Field
from typing import Optional, List

from app.repositories.template_repository import TemplateRepository

bp = APIBlueprint('templates', __name__)


# ─── Pydantic Schemas ─────────────────────────────────────────────────────────

class TemplateQuery(BaseModel):
    duration: Optional[int] = Field(None, description="Filter by suitable duration (minutes)")
    bloom: Optional[str] = Field(None, description="Filter by bloom level (e.g. 'NB', 'TH', 'VD')")
    student_count: Optional[int] = Field(None, description="Filter by suitable student count")


class TemplatePath(BaseModel):
    template_id: str = Field(..., description="ID of the template")


class SuitableForModel(BaseModel):
    duration_min: int = Field(..., example=30)
    duration_max: int = Field(..., example=45)
    bloom_levels: List[str] = Field(..., example=["NB", "TH"])
    student_count_min: int = Field(..., example=5)
    student_count_max: int = Field(..., example=60)


class NodeTemplateModel(BaseModel):
    node_type: str = Field(..., example="Khởi động")
    goal: str = Field(..., example="Kích hoạt kiến thức nền")
    suggested_duration_pct: float = Field(..., example=0.35)


class TemplateCreateModel(BaseModel):
    id: Optional[str] = Field(None, description="Optional ID (auto-slugified from name if not provided)")
    name: str = Field(..., example="Template Mới")
    description: str = Field(..., example="Mô tả template")
    tags: Optional[List[str]] = Field(default_factory=list, example=["ngắn"])
    suitable_for: SuitableForModel
    nodes: List[NodeTemplateModel]
    rag_activities: Optional[List[str]] = Field(default_factory=list, example=["Trò chơi ôn tập"])


# ─── Routes ───────────────────────────────────────────────────────────────────

@bp.get('/templates', summary="Get all lesson templates")
def get_templates(query: TemplateQuery):
    """GET /api/templates"""
    filters = {}
    if query.duration is not None:
        filters['duration'] = query.duration
    if query.bloom is not None:
        filters['bloom'] = query.bloom
    if query.student_count is not None:
        filters['student_count'] = query.student_count

    templates = TemplateRepository.get_all(filters if filters else None)
    return jsonify(templates), 200


@bp.get('/templates/<string:template_id>', summary="Get template by ID")
def get_template(path: TemplatePath):
    """GET /api/templates/<template_id>"""
    template = TemplateRepository.get_by_id(path.template_id)
    if not template:
        return jsonify({"error": "Not Found", "message": f"Template '{path.template_id}' not found"}), 404
    return jsonify(template), 200


@bp.post('/templates', summary="Create a new lesson template")
def create_template(body: TemplateCreateModel):
    """POST /api/templates"""
    data = body.dict()
    new_template = TemplateRepository.create(data)
    return jsonify(new_template), 201


@bp.put('/templates/<string:template_id>', summary="Update a lesson template")
def update_template(path: TemplatePath, body: TemplateCreateModel):
    """PUT /api/templates/<template_id>"""
    data = body.dict()
    updated = TemplateRepository.update(path.template_id, data)
    if not updated:
        return jsonify({"error": "Not Found", "message": f"Template '{path.template_id}' not found"}), 404
    return jsonify(updated), 200


@bp.delete('/templates/<string:template_id>', summary="Delete a lesson template")
def delete_template(path: TemplatePath):
    """DELETE /api/templates/<template_id>"""
    success = TemplateRepository.delete(path.template_id)
    if not success:
        return jsonify({"error": "Not Found", "message": f"Template '{path.template_id}' not found"}), 404
    return jsonify({"success": True, "message": f"Template '{path.template_id}' deleted"}), 200
