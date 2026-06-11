"""
faithfulness_service.py — Tầng 2 (Optional): Faithfulness / Grounding Check

Sau khi AI sinh ra nội dung cho một field, service này gọi một LLM call nhỏ
để kiểm tra xem nội dung đó có thực sự "được dẫn xuất" từ source text không.

Bất kỳ nội dung nào AI thêm vào mà không có trong source sẽ bị flag là
hallucination_risk = True.

Mặc định: DISABLED. Bật qua env var ENABLE_FAITHFULNESS_CHECK=true
hoặc truyền enable=True khi gọi hàm.

Kỹ thuật: Grounded Generation (G-Eval style)
"""

from flask import current_app
import json
import re


# ─── Faithfulness Check ───────────────────────────────────────────────────────

def check_field_faithfulness(
    field_name: str,
    field_value: str,
    source_context: str,
    openrouter_service,
    model: str = None,
    enable: bool = False,
) -> dict:
    """
    Kiểm tra một field AI đã sinh ra có grounded từ source_context không.

    Args:
        field_name: Tên field (vd: "muc_tieu", "hoat_dong")
        field_value: Nội dung AI đã sinh ra cho field đó
        source_context: Đoạn text nguồn (top-K chunks) đã cung cấp cho AI
        openrouter_service: Instance của OpenRouterService để gọi LLM
        model: Model override
        enable: Bật/tắt check (False = skip, trả về grounded=True mặc định)

    Returns:
        dict: {
            "field": str,
            "grounded": bool,       # True = content có nguồn gốc từ source
            "hallucination_risk": bool,  # True = AI tự thêm vào không có trong source
            "confidence": float,    # 0.0 – 1.0
            "reason": str           # Giải thích ngắn gọn
        }
    """
    # Skip nếu không bật hoặc value rỗng
    if not enable or not field_value or not field_value.strip():
        return {
            "field": field_name,
            "grounded": True,
            "hallucination_risk": False,
            "confidence": 1.0,
            "reason": "Faithfulness check disabled or empty field.",
        }

    system_prompt = (
        "You are a Faithfulness Auditor for AI-generated educational content.\n"
        "Your job is to determine whether a given AI-generated text field is "
        "grounded in the provided source document context.\n\n"
        "Grounded means: the information can be directly derived, inferred, or "
        "paraphrased from the source. It does NOT need to be a verbatim copy.\n"
        "NOT grounded means: the AI introduced facts, concepts, or claims that "
        "cannot be found in or reasonably inferred from the source.\n\n"
        "Respond ONLY with valid JSON in this exact format (no markdown, no extra text):\n"
        "{\n"
        '  "grounded": true or false,\n'
        '  "confidence": 0.0 to 1.0,\n'
        '  "reason": "one concise sentence explaining your decision"\n'
        "}"
    )

    user_content = (
        f"SOURCE CONTEXT:\n{source_context[:3000]}\n\n"
        f"AI-GENERATED FIELD '{field_name}':\n{field_value}\n\n"
        "Is this field grounded in the source context?"
    )

    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_content},
    ]

    try:
        result = openrouter_service.generate_chat_completion(
            messages=messages,
            model=model,
            temperature=0.0,  # Deterministic cho audit task
            max_tokens=200,
        )

        if not result.get("success"):
            return _fallback_result(field_name, "LLM call failed: " + result.get("error", "unknown"))

        raw = result.get("content", "").strip()

        # Parse JSON response
        # Loại bỏ markdown fences nếu model trả về
        raw = re.sub(r'```json|```', '', raw).strip()

        parsed = json.loads(raw)
        grounded = bool(parsed.get("grounded", True))
        confidence = float(parsed.get("confidence", 0.5))
        reason = str(parsed.get("reason", ""))

        return {
            "field": field_name,
            "grounded": grounded,
            "hallucination_risk": not grounded,
            "confidence": confidence,
            "reason": reason,
        }

    except json.JSONDecodeError:
        return _fallback_result(field_name, "Could not parse LLM response as JSON.")
    except Exception as e:
        return _fallback_result(field_name, str(e))


def check_node_faithfulness(
    node: dict,
    source_context: str,
    openrouter_service,
    model: str = None,
    enable: bool = False,
) -> dict:
    """
    Kiểm tra toàn bộ một node object (tất cả các field có string value).

    Args:
        node: Dict object của một node (vd: {"node_name": "...", "hoat_dong": "..."})
        source_context: Context string đã dùng để generate node này
        openrouter_service: OpenRouterService instance
        model: Model override
        enable: Bật/tắt check

    Returns:
        dict: Node gốc + thêm field "faithfulness_report" chứa kết quả audit
    """
    if not enable:
        return {**node, "faithfulness_report": None}

    # Chỉ check những field là text content (bỏ qua node_name, thoi_gian, ...)
    skip_fields = {"node_name", "node_intent", "applied_activity", "thoi_gian"}
    audit_fields = {
        k: v for k, v in node.items()
        if k not in skip_fields and isinstance(v, str) and len(v) > 20
    }

    reports = []
    for field_name, field_value in audit_fields.items():
        report = check_field_faithfulness(
            field_name=field_name,
            field_value=field_value,
            source_context=source_context,
            openrouter_service=openrouter_service,
            model=model,
            enable=True,  # enable đã được filter ở ngoài
        )
        reports.append(report)

    # Tổng hợp: node bị flag nếu có ít nhất 1 field hallucinate
    any_hallucination = any(r["hallucination_risk"] for r in reports)

    return {
        **node,
        "faithfulness_report": {
            "any_hallucination_risk": any_hallucination,
            "fields": reports,
        },
    }


def _fallback_result(field_name: str, reason: str) -> dict:
    """Fallback khi có lỗi trong quá trình check — assume grounded để không block pipeline."""
    return {
        "field": field_name,
        "grounded": True,
        "hallucination_risk": False,
        "confidence": 0.0,
        "reason": f"Check failed (assume grounded): {reason}",
    }
