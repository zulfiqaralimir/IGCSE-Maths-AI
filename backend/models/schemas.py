from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, Field


class ChatRequest(BaseModel):
    message: str
    topic: str = "Sets"
    question_id: UUID | None = None


class SimilarQuestion(BaseModel):
    id: UUID
    question_text: str
    difficulty: str
    subtopic: str | None


class ChatResponse(BaseModel):
    explanation: str
    steps: list[str]
    diagram_url: str | None
    similar_questions: list[SimilarQuestion]
    audio_url: str | None
    tool_used: str
    marks: int | None = None
    feedback: str | None = None


class EvaluateRequest(BaseModel):
    question_id: UUID
    student_answer: str


class EvaluateResponse(BaseModel):
    correct: bool
    marks: int
    max_marks: int
    feedback: str
    model_answer: str
    mark_scheme: str


class AdminQuestionCreate(BaseModel):
    question_text: str
    correct_answer: str
    mark_scheme: str
    topic: str = "Sets"
    subtopic: str | None = None
    concept_tags: list[str] = Field(default_factory=list)
    difficulty: str  # easy / medium / hard
    diagram_required: bool = False
    year: int | None = None
    paper: int | None = None
    variant: int | None = None
    source: str = "past_paper"
    diagram_url: str | None = None


class TagSuggestion(BaseModel):
    topic: str
    subtopic: str
    concept_tags: list[str]
    difficulty: str
    diagram_required: bool
