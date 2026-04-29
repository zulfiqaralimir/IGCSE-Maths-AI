-- Enable pgvector extension (run once per Supabase project)
create extension if not exists vector;

-- ============================================================
-- QUESTIONS TABLE
-- ============================================================
create table if not exists questions (
  id               uuid        primary key default gen_random_uuid(),

  -- Content
  question_text    text        not null,
  diagram_url      text,
  correct_answer   text        not null,
  mark_scheme      text        not null,

  -- Classification
  topic            text        not null,
  subtopic         text,
  concept_tags     jsonb       not null default '[]',
  difficulty       text        not null check (difficulty in ('easy', 'medium', 'hard')),
  diagram_required boolean     not null default false,

  -- Source metadata
  year             int,
  paper            int         check (paper in (2, 4)),
  variant          int         check (variant in (1, 2, 3)),
  source           text        not null default 'past_paper'
                               check (source in ('past_paper', 'generated')),

  -- RAG
  embedding        vector(1536),

  created_at       timestamptz not null default now()
);

-- ============================================================
-- INDEXES
-- ============================================================

-- Vector similarity search (cosine) — requires at least 1 row before building
create index if not exists questions_embedding_idx
  on questions using ivfflat (embedding vector_cosine_ops)
  with (lists = 100);

-- Filtering indexes used alongside vector search
create index if not exists questions_topic_idx       on questions (topic, subtopic);
create index if not exists questions_difficulty_idx  on questions (difficulty);
create index if not exists questions_source_idx      on questions (source);
create index if not exists questions_paper_idx       on questions (year, paper, variant);

-- ============================================================
-- MATCH QUESTIONS FUNCTION (used by RAG pipeline)
-- Returns top-k questions by cosine similarity, optionally
-- filtered by topic and/or difficulty.
-- ============================================================
create or replace function match_questions (
  query_embedding  vector(1536),
  match_count      int     default 3,
  filter_topic     text    default null,
  filter_difficulty text   default null
)
returns table (
  id               uuid,
  question_text    text,
  correct_answer   text,
  mark_scheme      text,
  topic            text,
  subtopic         text,
  concept_tags     jsonb,
  difficulty       text,
  diagram_required boolean,
  similarity       float
)
language plpgsql
as $$
begin
  return query
  select
    q.id,
    q.question_text,
    q.correct_answer,
    q.mark_scheme,
    q.topic,
    q.subtopic,
    q.concept_tags,
    q.difficulty,
    q.diagram_required,
    1 - (q.embedding <=> query_embedding) as similarity
  from questions q
  where
    q.embedding is not null
    and (filter_topic     is null or q.topic      = filter_topic)
    and (filter_difficulty is null or q.difficulty = filter_difficulty)
  order by q.embedding <=> query_embedding
  limit match_count;
end;
$$;
