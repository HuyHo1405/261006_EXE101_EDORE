"""
qdrant_schemas.py — Pydantic schemas cho Qdrant API responses.
"""

from pydantic import BaseModel, Field
from typing import List, Optional


class CollectionInfo(BaseModel):
    name: str
    points_count: int
    vector_size: int
    distance: str
    status: str


class SearchResult(BaseModel):
    score: float
    text: str
    source: str
    chunk_index: int


class IndexResponse(BaseModel):
    success: bool
    source: str
    collection: str
    chunks_indexed: int


class DeleteResponse(BaseModel):
    success: bool
    deleted_count: int
    source: str
    collection: str
