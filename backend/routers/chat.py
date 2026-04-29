"""
POST /chat  — main student interaction endpoint

Flow:
  1. Detect intent
  2. Route to tool OR run RAG explanation
  3. Post-validate (up to 2 attempts)
  4. Return structured response
"""

from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException

from backend.models.schemas import ChatRequest, ChatResponse, SimilarQuestion
from backend.services import rag, tools, validation

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/chat", tags=["chat"])

_SAFE_FALLBACK = (
    "I was unable to generate a reliable answer for this question. "
    "Please review your textbook or ask your teacher for help with this topic."
)


@router.post("", response_model=ChatResponse)
async def chat(req: ChatRequest) -> ChatResponse:
    intent = tools.detect_intent(req.message)

    # -----------------------------------------------------------------------
    # Branch: evaluate_answer
    # -----------------------------------------------------------------------
    if intent == "evaluate_answer" and req.question_id:
        result = tools.evaluate_answer(str(req.question_id), req.message)
        return ChatResponse(
            explanation=result.get("feedback", ""),
            steps=[result.get("model_answer", "")],
            diagram_url=None,
            similar_questions=[],
            audio_url=None,
            tool_used="evaluate_answer",
            marks=result.get("marks"),
            feedback=result.get("feedback"),
        )

    # -----------------------------------------------------------------------
    # Branch: get_similar_questions
    # -----------------------------------------------------------------------
    if intent == "get_similar_questions":
        similar_raw = tools.get_similar_questions(req.message, req.topic)
        similar = [SimilarQuestion(**q) for q in similar_raw]
        return ChatResponse(
            explanation="Here are similar questions for you to practise:",
            steps=[],
            diagram_url=None,
            similar_questions=similar,
            audio_url=None,
            tool_used="get_similar_questions",
        )

    # -----------------------------------------------------------------------
    # Branch: generate_diagram (+ explanation)
    # -----------------------------------------------------------------------
    diagram_url: str | None = None
    if intent == "generate_diagram":
        try:
            diagram_url = tools.generate_diagram(req.message)
        except Exception as exc:
            logger.warning("Diagram generation failed: %s", exc)

    # -----------------------------------------------------------------------
    # RAG explanation with post-validation (max 2 attempts)
    # -----------------------------------------------------------------------
    last_result: dict | None = None

    for attempt in range(2):
        last_result = rag.answer_with_rag(req.message, topic=req.topic)
        ai_text = last_result["explanation"]

        # Validate: structure only (no DB correct_answer available here)
        v = validation.validate_structure(ai_text)
        if v.passed:
            break
        logger.warning("Validation attempt %d failed: %s", attempt + 1, v.failures)

    if not last_result or not validation.validate_structure(last_result["explanation"]).passed:
        explanation = _SAFE_FALLBACK
        steps: list[str] = []
    else:
        explanation = last_result["explanation"]
        steps = last_result["steps"]

    # Fetch similar questions in all explain/diagram paths
    similar_raw = tools.get_similar_questions(req.message, req.topic)
    similar = [SimilarQuestion(**q) for q in similar_raw]

    return ChatResponse(
        explanation=explanation,
        steps=steps,
        diagram_url=diagram_url,
        similar_questions=similar,
        audio_url=None,
        tool_used=intent,
    )
