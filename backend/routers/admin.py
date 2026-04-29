"""
Admin CMS endpoints

GET    /admin/questions          — list all questions
POST   /admin/questions          — add question (requires review before saving)
DELETE /admin/questions/{id}     — delete question
POST   /admin/questions/generate-tags — AI-assisted tagging (user MUST review)
"""

from __future__ import annotations

from uuid import UUID

from fastapi import APIRouter, HTTPException

from backend.config import get_supabase
from backend.models.schemas import AdminQuestionCreate, TagSuggestion
from backend.services.ai import generate_tags
from backend.services.rag import embed

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/questions")
def list_questions(topic: str | None = None, difficulty: str | None = None):
    q = get_supabase().table("questions").select(
        "id, question_text, topic, subtopic, difficulty, source, year, paper, variant, diagram_required"
    )
    if topic:
        q = q.eq("topic", topic)
    if difficulty:
        q = q.eq("difficulty", difficulty)
    return q.order("created_at", desc=True).execute().data


@router.post("/questions", status_code=201)
def create_question(payload: AdminQuestionCreate):
    row = payload.model_dump()

    # Generate and store embedding immediately
    embed_input = f"{row['topic']} | {row.get('subtopic') or ''} | {row['question_text']} | {row['correct_answer']}"
    row["embedding"] = embed(embed_input)

    result = get_supabase().table("questions").insert(row).execute()
    return result.data[0]


@router.delete("/questions/{question_id}", status_code=204)
def delete_question(question_id: UUID):
    result = (
        get_supabase()
        .table("questions")
        .delete()
        .eq("id", str(question_id))
        .execute()
    )
    if not result.data:
        raise HTTPException(status_code=404, detail="Question not found")


@router.post("/questions/generate-tags", response_model=TagSuggestion)
def ai_generate_tags(question_text: str, mark_scheme: str):
    """
    Returns AI-suggested tags. The user MUST review before calling POST /admin/questions.
    """
    return generate_tags(question_text, mark_scheme)
