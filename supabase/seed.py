"""
Seed script: inserts IGCSE Sets questions into Supabase.
Run AFTER applying schema.sql.

Usage:
    pip install supabase python-dotenv
    python supabase/seed.py

Embeddings are populated separately by generate_embeddings.py.
"""

import os
from dotenv import load_dotenv
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]

# ---------------------------------------------------------------------------
# Seed data — 10 IGCSE Sets questions
# correct_answer: concise final answer(s)
# mark_scheme:    examiner-style marking notes
# ---------------------------------------------------------------------------
QUESTIONS = [
    {
        "question_text": (
            "ξ = {integers from 1 to 10 inclusive}\n"
            "A = {even numbers}\n"
            "B = {multiples of 3}\n\n"
            "(a) List the elements of A ∩ B.\n"
            "(b) List the elements of A'.\n"
            "(c) List the elements of A ∪ B."
        ),
        "correct_answer": "(a) {6}  (b) {1, 3, 5, 7, 9}  (c) {2, 3, 4, 6, 8, 9, 10}",
        "mark_scheme": (
            "(a) {6} [B1]\n"
            "(b) {1, 3, 5, 7, 9} [B1]\n"
            "(c) {2, 3, 4, 6, 8, 9, 10} [B1]"
        ),
        "topic": "Sets",
        "subtopic": "Set Notation and Listing",
        "concept_tags": ["intersection", "complement", "union", "listing elements"],
        "difficulty": "easy",
        "diagram_required": False,
        "source": "generated",
    },
    {
        "question_text": (
            "List the elements of the set {x : x is a prime number, 10 < x < 30}."
        ),
        "correct_answer": "{11, 13, 17, 19, 23, 29}",
        "mark_scheme": (
            "{11, 13, 17, 19, 23, 29} [B2]\n"
            "B1 for at least 4 correct primes with no extras"
        ),
        "topic": "Sets",
        "subtopic": "Set Builder Notation",
        "concept_tags": ["set builder notation", "prime numbers", "listing elements"],
        "difficulty": "easy",
        "diagram_required": False,
        "source": "generated",
    },
    {
        "question_text": (
            "In a class of 30 students, 18 play football (F) and 12 play tennis (T).\n"
            "5 students play both sports.\n\n"
            "(a) Find n(F ∪ T).\n"
            "(b) Find the number of students who play neither sport."
        ),
        "correct_answer": "(a) 25  (b) 5",
        "mark_scheme": (
            "(a) n(F ∪ T) = 18 + 12 − 5 = 25 [M1 A1]\n"
            "(b) 30 − 25 = 5 [M1 A1]"
        ),
        "topic": "Sets",
        "subtopic": "Venn Diagrams — Two Sets",
        "concept_tags": ["union", "two-set venn", "word problem", "n(A∪B) formula"],
        "difficulty": "medium",
        "diagram_required": True,
        "source": "generated",
    },
    {
        "question_text": (
            "n(ξ) = 40,  n(A) = 22,  n(B) = 18,  n(A ∩ B) = 7\n\n"
            "(a) Find n(A ∪ B).\n"
            "(b) Find n(A' ∩ B')."
        ),
        "correct_answer": "(a) 33  (b) 7",
        "mark_scheme": (
            "(a) n(A ∪ B) = 22 + 18 − 7 = 33 [M1 A1]\n"
            "(b) n(A' ∩ B') = 40 − 33 = 7 [M1 A1]"
        ),
        "topic": "Sets",
        "subtopic": "Venn Diagrams — Two Sets",
        "concept_tags": ["n(A∪B) formula", "complement", "two-set venn"],
        "difficulty": "medium",
        "diagram_required": False,
        "source": "generated",
    },
    {
        "question_text": (
            "On a Venn diagram showing sets A and B inside universal set ξ,\n"
            "shade the region that represents A' ∩ B."
        ),
        "correct_answer": "The region inside B but outside A (B only region).",
        "mark_scheme": (
            "Correct shading of the region inside B and outside A [B2]\n"
            "B1 if B is fully shaded but A ∩ B is not excluded"
        ),
        "topic": "Sets",
        "subtopic": "Shading Venn Diagrams",
        "concept_tags": ["shading", "complement", "intersection", "two-set venn"],
        "difficulty": "easy",
        "diagram_required": True,
        "source": "generated",
    },
    {
        "question_text": (
            "P = {factors of 24}\n"
            "Q = {factors of 36}\n"
            "ξ = {positive integers from 1 to 36}\n\n"
            "(a) List P ∩ Q.\n"
            "(b) List P ∪ Q.\n"
            "(c) Find n(P' ∩ Q')."
        ),
        "correct_answer": (
            "(a) {1, 2, 3, 4, 6, 12}  "
            "(b) {1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36}  "
            "(c) 25"
        ),
        "mark_scheme": (
            "(a) {1, 2, 3, 4, 6, 12} [B2] (B1 for 4+ correct)\n"
            "(b) {1, 2, 3, 4, 6, 8, 9, 12, 18, 24, 36} [B2] (B1 for 8+ correct)\n"
            "(c) n(P ∪ Q) = 11,  n(P' ∩ Q') = 36 − 11 = 25 [M1 A1]"
        ),
        "topic": "Sets",
        "subtopic": "Set Notation and Listing",
        "concept_tags": ["factors", "intersection", "union", "complement", "listing elements"],
        "difficulty": "medium",
        "diagram_required": False,
        "source": "generated",
    },
    {
        "question_text": (
            "A survey of 50 people asked which subjects they liked.\n"
            "The results for Maths (M) and Science (S) are shown below.\n\n"
            "• Only Maths: 14\n"
            "• Only Science: 11\n"
            "• Both Maths and Science: 9\n"
            "• Neither: x\n\n"
            "(a) Find the value of x.\n"
            "(b) A person is chosen at random. Find the probability they like exactly one subject.\n"
            "(c) On the Venn diagram, shade M' ∩ S."
        ),
        "correct_answer": "(a) x = 16  (b) 25/50 = 1/2  (c) Science-only region shaded",
        "mark_scheme": (
            "(a) 50 − (14 + 11 + 9) = 16 [M1 A1]\n"
            "(b) (14 + 11)/50 = 25/50 = 1/2 [M1 A1]\n"
            "(c) Correct shading of Science-only region [B1]"
        ),
        "topic": "Sets",
        "subtopic": "Venn Diagrams — Two Sets",
        "concept_tags": ["two-set venn", "probability", "shading", "word problem"],
        "difficulty": "medium",
        "diagram_required": True,
        "source": "generated",
    },
    {
        "question_text": (
            "A group of 80 students were asked about three after-school clubs:\n"
            "Drama (D), Football (F), and Music (M).\n\n"
            "• n(D ∩ F ∩ M) = 3\n"
            "• n(D ∩ F only) = 5\n"
            "• n(D ∩ M only) = 4\n"
            "• n(F ∩ M only) = 6\n"
            "• n(D only) = 12\n"
            "• n(F only) = 18\n"
            "• n(M only) = 14\n"
            "• n(none) = 18\n\n"
            "(a) Verify that the total is 80.\n"
            "(b) Find n(D).\n"
            "(c) Find n(F ∪ M).\n"
            "(d) A student is chosen at random. Find P(student is in exactly two clubs)."
        ),
        "correct_answer": (
            "(a) 3+5+4+6+12+18+14+18 = 80 ✓  "
            "(b) 24  "
            "(c) 49  "
            "(d) 15/80 = 3/16"
        ),
        "mark_scheme": (
            "(a) 12+5+18+4+3+6+14+18 = 80 [B1]\n"
            "(b) n(D) = 12 + 5 + 4 + 3 = 24 [M1 A1]\n"
            "(c) n(F) = 18+5+6+3=32, n(M)=14+4+6+3=27, n(F∩M)=6+3=9, "
            "n(F∪M)=32+27−9=50; or count directly = 18+5+6+3+14+4+6−3 "
            "— accept 50 [M1 A1]\n"
            "Note: re-checking: n(F∪M) = 18+5+6+3+14+4 = 50. Accept 50.\n"
            "(d) exactly two clubs = 5+4+6 = 15, P = 15/80 = 3/16 [M1 A1]"
        ),
        "topic": "Sets",
        "subtopic": "Venn Diagrams — Three Sets",
        "concept_tags": ["three-set venn", "probability", "word problem", "union"],
        "difficulty": "hard",
        "diagram_required": True,
        "source": "generated",
    },
    {
        "question_text": (
            "ξ = {x : x is an integer, 1 ≤ x ≤ 20}\n"
            "A = {x : x is a multiple of 4}\n"
            "B = {x : x is a multiple of 6}\n\n"
            "(a) List A.\n"
            "(b) List B.\n"
            "(c) Find n(A ∪ B).\n"
            "(d) Find n(A' ∩ B')."
        ),
        "correct_answer": (
            "(a) {4, 8, 12, 16, 20}  "
            "(b) {6, 12, 18}  "
            "(c) 7  "
            "(d) 13"
        ),
        "mark_scheme": (
            "(a) {4, 8, 12, 16, 20} [B1]\n"
            "(b) {6, 12, 18} [B1]\n"
            "(c) A ∩ B = {12}, n(A ∪ B) = 5 + 3 − 1 = 7 [M1 A1]\n"
            "(d) n(A' ∩ B') = 20 − 7 = 13 [M1 A1]"
        ),
        "topic": "Sets",
        "subtopic": "Set Notation and Listing",
        "concept_tags": ["multiples", "intersection", "union", "complement"],
        "difficulty": "medium",
        "diagram_required": False,
        "source": "generated",
    },
    {
        "question_text": (
            "On a Venn diagram with three sets A, B, and C inside ξ,\n"
            "shade the region that represents (A ∪ B) ∩ C'."
        ),
        "correct_answer": "Shade the region inside A or B (or both) but outside C.",
        "mark_scheme": (
            "Correct shading: all of A and B except the parts that overlap with C [B2]\n"
            "B1 for shading A ∪ B fully (ignoring the C exclusion)"
        ),
        "topic": "Sets",
        "subtopic": "Shading Venn Diagrams",
        "concept_tags": ["shading", "three-set venn", "union", "complement"],
        "difficulty": "hard",
        "diagram_required": True,
        "source": "generated",
    },
]


def seed(client: Client) -> None:
    existing = client.table("questions").select("id", count="exact").execute()
    if existing.count and existing.count > 0:
        print(f"Table already has {existing.count} row(s). Skipping seed to avoid duplicates.")
        print("Delete all rows first if you want to re-seed.")
        return

    rows = []
    for q in QUESTIONS:
        row = dict(q)
        row["concept_tags"] = q["concept_tags"]  # supabase-py accepts list for jsonb
        rows.append(row)

    result = client.table("questions").insert(rows).execute()
    print(f"Inserted {len(result.data)} questions successfully.")


if __name__ == "__main__":
    client: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    seed(client)
    print("Done. Run generate_embeddings.py next to populate the embedding column.")
