"""
template_repository.py — Data access layer cho LessonTemplate.

Thin wrapper quanh TemplateStore (in-memory).
Khi cần swap sang SQLAlchemy, chỉ cần thay thế implementation ở đây —
controllers và services không đổi gì cả.
"""

from typing import Optional
from app.models.template_store import TemplateStore


class TemplateRepository:

    @staticmethod
    def get_all(filters: Optional[dict] = None) -> list:
        return TemplateStore.get_all(filters)

    @staticmethod
    def get_by_id(template_id: str) -> Optional[dict]:
        return TemplateStore.get_by_id(template_id)

    @staticmethod
    def create(data: dict) -> dict:
        return TemplateStore.create(data)

    @staticmethod
    def update(template_id: str, data: dict) -> Optional[dict]:
        return TemplateStore.update(template_id, data)

    @staticmethod
    def delete(template_id: str) -> bool:
        return TemplateStore.delete(template_id)
