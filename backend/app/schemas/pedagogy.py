from pydantic import BaseModel, Field
from typing import Any, Optional

# ─── Feature 2: Node Mapping ─────────────────────────────────────────────────

class MapRequest(BaseModel):
    extracted_knowledge: str = Field(
        ...,
        description="Raw text already extracted from the source document (output of Feature 1).",
        examples=["Quang hợp là quá trình cây xanh chuyển ánh sáng thành glucose..."]
    )
    system_template: str = Field(
        ...,
        description="Text describing the lesson node template (e.g. 'Node 1: Warm-up, Node 2: Core Theory, Node 3: Practice').",
        examples=["Nút 1: Khởi động, Nút 2: Lý thuyết cốt lõi, Nút 3: Thực hành"]
    )
    model: Optional[str] = Field(None, description="Optional OpenRouter model override.")
    temperature: Optional[float] = Field(0.3, description="Sampling temperature (default 0.3).")

class MapResponse(BaseModel):
    success: bool
    mapped_nodes: Optional[str] = Field(None, description="AI-generated JSON array of mapped nodes as a string.")
    error: Optional[str] = None

# ─── Feature 3: Activity Enrichment ─────────────────────────────────────────

class EnrichRequest(BaseModel):
    mapped_nodes: Any = Field(
        ...,
        description="Array of mapped node objects (output of Feature 2), or a JSON string representation."
    )
    rag_activities: Any = Field(
        ...,
        description="List of teaching methodology strings retrieved from the Vector DB / RAG context."
    )
    model: Optional[str] = Field(None, description="Optional OpenRouter model override.")
    temperature: Optional[float] = Field(0.5, description="Sampling temperature (default 0.5).")

class EnrichResponse(BaseModel):
    success: bool
    enriched_script: Optional[str] = Field(None, description="AI-generated final pedagogical script as a JSON string.")
    error: Optional[str] = None

# ─── General Chat ─────────────────────────────────────────────────────────────

class ChatRequest(BaseModel):
    prompt: Optional[str] = Field(None, description="A single user prompt string.")
    messages: Optional[list] = Field(None, description="Full message history (role/content pairs).")
    model: Optional[str] = Field(None, description="Optional OpenRouter model override.")
    temperature: Optional[float] = Field(0.7, description="Sampling temperature.")
    max_tokens: Optional[int] = Field(1000, description="Maximum tokens to generate.")

class ChatResponse(BaseModel):
    success: bool
    response: Optional[str] = None
    model: Optional[str] = None
    usage: Optional[dict] = None
    error: Optional[str] = None

# ─── Pipeline ─────────────────────────────────────────────────────────────────

class PipelineResponse(BaseModel):
    success: bool
    raw_extracted_text: Optional[str] = None
    mapped_nodes: Optional[str] = None
    final_pedagogical_script: Optional[str] = None
    error: Optional[str] = None
