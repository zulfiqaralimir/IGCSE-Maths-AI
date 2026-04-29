"""RAG pipeline: embed → retrieve → build prompt."""

from __future__ import annotations

from backend.config import get_openai, get_settings, get_supabase
from backend.services.ai import SYSTEM_PROMPT, call_ai


def embed(text: str) -> list[float]:
    s = get_settings()
    response = get_openai().embeddings.create(
        model=s.embed_model,
        input=text.replace("\n", " "),
    )
    return response.data[0].embedding


def retrieve(
    query_embedding: list[float],
    topic: str | None = None,
    difficulty: str | None = None,
    k: int = 3,
) -> list[dict]:
    result = get_supabase().rpc(
        "match_questions",
        {
            "query_embedding": query_embedding,
            "match_count": k,
            "filter_topic": topic,
            "filter_difficulty": difficulty,
        },
    ).execute()
    return result.data or []


def _format_context(retrieved: list[dict]) -> str:
    if not retrieved:
        return ""
    parts = ["--- Retrieved Examples ---"]
    for i, q in enumerate(retrieved, 1):
        parts.append(
            f"\nExample {i} ({q.get('difficulty', '')} | {q.get('subtopic', '')}):\n"
            f"Q: {q['question_text']}\n"
            f"Answer: {q['correct_answer']}\n"
            f"Mark scheme: {q['mark_scheme']}"
        )
    parts.append("--- End of Examples ---")
    return "\n".join(parts)


def answer_with_rag(user_message: str, topic: str = "Sets") -> dict:
    """
    Full RAG pipeline: embed → retrieve → inject context → call AI.
    Returns {"explanation": str, "steps": list[str], "context_used": bool}.
    """
    embedding = embed(user_message)
    retrieved = retrieve(embedding, topic=topic)
    context = _format_context(retrieved)

    user_content = user_message
    if context:
        user_content = f"{context}\n\nStudent question: {user_message}"

    messages = [
        {"role": "system", "content": SYSTEM_PROMPT},
        {"role": "user", "content": user_content},
    ]

    raw = call_ai(messages)
    steps = _parse_steps(raw)

    return {
        "explanation": raw,
        "steps": steps,
        "context_used": bool(retrieved),
    }


def _parse_steps(text: str) -> list[str]:
    lines = text.splitlines()
    steps = [
        line.strip()
        for line in lines
        if line.strip().startswith(("Step ", "Final Answer"))
    ]
    return steps
