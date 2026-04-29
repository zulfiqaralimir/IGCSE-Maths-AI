"""
Tool implementations:
  - detect_intent
  - generate_diagram
  - get_similar_questions
  - evaluate_answer
"""

from __future__ import annotations

import io
import json
import uuid

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib_venn import venn2, venn3

from backend.config import get_openai, get_settings, get_supabase
from backend.services.ai import SYSTEM_PROMPT, call_ai
from backend.services.rag import embed

# ---------------------------------------------------------------------------
# Region shading maps (binary patch IDs used by matplotlib-venn)
# ---------------------------------------------------------------------------
SHADE_VENN2: dict[str, list[str]] = {
    "a":        ["10", "11"],
    "b":        ["01", "11"],
    "a'":       ["01"],
    "b'":       ["10"],
    "a ∩ b":    ["11"],
    "a ∪ b":    ["10", "01", "11"],
    "a' ∩ b":   ["01"],
    "a ∩ b'":   ["10"],
    "a' ∩ b'":  [],           # outside both circles — not patchable
    "a' ∪ b":   ["01", "11"],
    "a ∪ b'":   ["10", "11"],
    "a' ∪ b'":  ["10", "01"],
}

SHADE_VENN3: dict[str, list[str]] = {
    "a ∩ b ∩ c":          ["111"],
    "(a ∪ b) ∩ c'":       ["100", "010", "110"],
    "a ∩ b":              ["110", "111"],
    "a ∩ c":              ["101", "111"],
    "b ∩ c":              ["011", "111"],
    "a only":             ["100"],
    "b only":             ["010"],
    "c only":             ["001"],
    "a ∪ b ∪ c":          ["100", "010", "001", "110", "101", "011", "111"],
}


# ---------------------------------------------------------------------------
# Intent detection
# ---------------------------------------------------------------------------
def detect_intent(message: str) -> str:
    m = message.lower()
    if any(w in m for w in ["draw", "graph", "venn", "diagram", "shade", "sketch"]):
        return "generate_diagram"
    if any(w in m for w in ["similar", "practice", "more question", "another question", "give me"]):
        return "get_similar_questions"
    if any(w in m for w in ["my answer", "i got", "is this right", "check my", "i think the answer"]):
        return "evaluate_answer"
    return "explain"


# ---------------------------------------------------------------------------
# Tool: generate_diagram
# ---------------------------------------------------------------------------
def _extract_diagram_params(question_text: str) -> dict:
    """Ask AI to extract diagram type + labels from question text."""
    prompt = (
        "Extract Venn diagram parameters from this question. "
        "Return ONLY valid JSON, no markdown:\n"
        '{"type": "venn2" or "venn3", '
        '"set_labels": ["A","B"] or ["A","B","C"], '
        '"shade_region": "<expression or null>", '
        '"title": "<short title>"}\n\n'
        f"Question: {question_text}"
    )
    raw = call_ai([{"role": "user", "content": prompt}], temperature=0.0)
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {"type": "venn2", "set_labels": ["A", "B"], "shade_region": None, "title": "Venn Diagram"}


def _draw_venn(params: dict) -> bytes:
    fig, ax = plt.subplots(figsize=(6, 4))
    ax.set_aspect("equal")

    labels = params.get("set_labels", ["A", "B"])
    shade_expr = (params.get("shade_region") or "").strip().lower()
    title = params.get("title", "Venn Diagram")
    diagram_type = params.get("type", "venn2")

    if diagram_type == "venn3" and len(labels) >= 3:
        v = venn3(subsets=(1, 1, 1, 1, 1, 1, 1), set_labels=labels[:3], ax=ax)
        shade_ids = SHADE_VENN3.get(shade_expr, [])
    else:
        v = venn2(subsets=(1, 1, 1), set_labels=labels[:2], ax=ax)
        shade_ids = SHADE_VENN2.get(shade_expr, [])

    for region_id in shade_ids:
        patch = v.get_patch_by_id(region_id)
        if patch:
            patch.set_facecolor("#4A90D9")
            patch.set_alpha(0.55)

    if shade_expr and not shade_ids:
        ax.set_title(f"{title}\n(shade: {shade_expr})", fontsize=11)
    else:
        ax.set_title(title, fontsize=12)

    buf = io.BytesIO()
    fig.savefig(buf, format="png", dpi=150, bbox_inches="tight")
    plt.close(fig)
    buf.seek(0)
    return buf.read()


def generate_diagram(question_text: str) -> str | None:
    """Generate a Venn diagram, upload to Supabase Storage, return public URL."""
    params = _extract_diagram_params(question_text)
    png_bytes = _draw_venn(params)

    supabase = get_supabase()
    bucket = get_settings().diagram_bucket
    filename = f"{uuid.uuid4()}.png"

    supabase.storage.from_(bucket).upload(
        filename,
        png_bytes,
        {"content-type": "image/png"},
    )
    return supabase.storage.from_(bucket).get_public_url(filename)


# ---------------------------------------------------------------------------
# Tool: get_similar_questions
# ---------------------------------------------------------------------------
def get_similar_questions(message: str, topic: str = "Sets") -> list[dict]:
    query_embedding = embed(message)
    result = get_supabase().rpc(
        "match_questions",
        {
            "query_embedding": query_embedding,
            "match_count": 3,
            "filter_topic": topic,
            "filter_difficulty": None,
        },
    ).execute()
    rows = result.data or []
    return [
        {
            "id": str(r["id"]),
            "question_text": r["question_text"],
            "difficulty": r["difficulty"],
            "subtopic": r.get("subtopic"),
        }
        for r in rows
    ]


# ---------------------------------------------------------------------------
# Tool: evaluate_answer
# ---------------------------------------------------------------------------
def evaluate_answer(question_id: str, student_answer: str) -> dict:
    row = (
        get_supabase()
        .table("questions")
        .select("question_text, correct_answer, mark_scheme")
        .eq("id", question_id)
        .single()
        .execute()
        .data
    )
    if not row:
        return {
            "correct": False,
            "marks": 0,
            "max_marks": 0,
            "feedback": "Question not found.",
            "model_answer": "",
            "mark_scheme": "",
        }

    prompt = (
        f"Question:\n{row['question_text']}\n\n"
        f"Mark scheme:\n{row['mark_scheme']}\n\n"
        f"Correct answer:\n{row['correct_answer']}\n\n"
        f"Student's answer:\n{student_answer}\n\n"
        "Evaluate the student's answer using the mark scheme. "
        "Return ONLY valid JSON:\n"
        '{"correct": true/false, "marks": <int>, "max_marks": <int>, '
        '"feedback": "<constructive feedback>", "model_answer": "<full worked solution>"}'
    )

    raw = call_ai(
        [
            {"role": "system", "content": SYSTEM_PROMPT},
            {"role": "user", "content": prompt},
        ],
        temperature=0.0,
    )
    try:
        result = json.loads(raw)
        result["mark_scheme"] = row["mark_scheme"]
        return result
    except json.JSONDecodeError:
        return {
            "correct": False,
            "marks": 0,
            "max_marks": 0,
            "feedback": "Could not evaluate answer. Please try again.",
            "model_answer": row["correct_answer"],
            "mark_scheme": row["mark_scheme"],
        }
