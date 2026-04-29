"""Central AI call wrapper + prompt templates."""

from __future__ import annotations

import json

from backend.config import get_openai, get_settings
from backend.models.schemas import TagSuggestion

SYSTEM_PROMPT = """You are an IGCSE Mathematics tutor (Cambridge curriculum).

Rules:
- Explain step by step in simple language suitable for students aged 14–16.
- Structure EVERY response exactly like this:
    Step 1: <first step>
    Step 2: <second step>
    ...
    Final Answer: <concise answer>
- Follow the mark scheme strictly when one is provided.
- Never guess or invent mathematical facts.
- If you are unsure, say: "I am not sure — please check with your teacher."
- Use the retrieved examples as your primary reference.
- Do NOT add unnecessary preamble or closing remarks."""

TAG_PROMPT = """You are an IGCSE exam question classifier.

Return ONLY valid JSON matching this schema (no markdown, no extra text):
{{
  "topic": "Sets",
  "subtopic": "<specific subtopic>",
  "concept_tags": ["<tag1>", "<tag2>"],
  "difficulty": "<easy|medium|hard>",
  "diagram_required": <true|false>
}}

Classify this question:
---
{question_text}
---
Mark scheme:
{mark_scheme}"""


def call_ai(messages: list[dict], temperature: float = 0.2) -> str:
    s = get_settings()
    response = get_openai().chat.completions.create(
        model=s.ai_model,
        messages=messages,
        temperature=temperature,
        max_tokens=1024,
    )
    return response.choices[0].message.content.strip()


def generate_tags(question_text: str, mark_scheme: str) -> TagSuggestion:
    prompt = TAG_PROMPT.format(question_text=question_text, mark_scheme=mark_scheme)
    raw = call_ai([{"role": "user", "content": prompt}], temperature=0.0)
    data = json.loads(raw)
    return TagSuggestion(**data)
