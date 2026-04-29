"""
Generates and stores embeddings for all questions missing one.
Uses OpenAI text-embedding-3-small (1536 dimensions).

Usage:
    python supabase/generate_embeddings.py
"""

import os
import time
from dotenv import load_dotenv
from openai import OpenAI
from supabase import create_client, Client

load_dotenv()

SUPABASE_URL = os.environ["SUPABASE_URL"]
SUPABASE_SERVICE_KEY = os.environ["SUPABASE_SERVICE_KEY"]
OPENAI_API_KEY = os.environ["OPENAI_API_KEY"]

EMBED_MODEL = "text-embedding-3-small"


def embed_text(openai_client: OpenAI, text: str) -> list[float]:
    response = openai_client.embeddings.create(
        model=EMBED_MODEL,
        input=text.replace("\n", " "),
    )
    return response.data[0].embedding


def build_embed_input(row: dict) -> str:
    """Combine fields that are semantically meaningful for retrieval."""
    parts = [
        row["topic"],
        row.get("subtopic") or "",
        row["question_text"],
        row["correct_answer"],
    ]
    return " | ".join(p for p in parts if p)


def main() -> None:
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
    openai_client = OpenAI(api_key=OPENAI_API_KEY)

    # Fetch only rows without embeddings
    rows = (
        supabase.table("questions")
        .select("id, topic, subtopic, question_text, correct_answer")
        .is_("embedding", "null")
        .execute()
        .data
    )

    if not rows:
        print("No rows missing embeddings.")
        return

    print(f"Generating embeddings for {len(rows)} question(s)...")

    for i, row in enumerate(rows, 1):
        text = build_embed_input(row)
        embedding = embed_text(openai_client, text)

        supabase.table("questions").update({"embedding": embedding}).eq(
            "id", row["id"]
        ).execute()

        print(f"  [{i}/{len(rows)}] {row['id']} — done")

        # Stay well within OpenAI rate limits
        if i % 10 == 0:
            time.sleep(1)

    print("All embeddings generated.")


if __name__ == "__main__":
    main()
