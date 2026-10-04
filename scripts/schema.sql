-- ==============================================================================
-- CampusSaarthi — Supabase pgvector Migration & Schema
-- Run this in the Supabase SQL Editor (Dashboard -> SQL Editor -> New Query)
-- ==============================================================================

-- 1. Enable pgvector extension
create extension if not exists vector;

-- 2. Users Table
create table if not exists public.users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  role text default 'student' check (role in ('student', 'admin')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Knowledge Base Table (with 384-dimensional dense vectors)
create table if not exists public.knowledge_base (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  question text not null unique,
  answer text not null,
  source_document text not null,
  contact_if_unsure text,
  embedding vector(384),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cosine Distance HNSW Index on Knowledge Base Embeddings
create index if not exists kb_embedding_hnsw_idx 
on public.knowledge_base 
using hnsw (embedding vector_cosine_ops);

-- 4. Query Cache Table (for instant >0.95 semantic match routing)
create table if not exists public.query_cache (
  id uuid primary key default gen_random_uuid(),
  question_text text not null,
  question_embedding vector(384) not null,
  cached_answer text not null,
  source_ids text[],
  hit_count integer default 1,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Cosine Distance HNSW Index on Query Cache Embeddings
create index if not exists query_cache_hnsw_idx 
on public.query_cache 
using hnsw (question_embedding vector_cosine_ops);

-- 5. Queries Log Table (Full Audit Trail & Cost Tracking)
create table if not exists public.queries_log (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.users(id) on delete set null,
  question text not null,
  answer_given text,
  confidence_score double precision default 0.0,
  sources_used text[],
  was_escalated boolean default false,
  model_used text not null,
  tokens_in integer default 0,
  tokens_out integer default 0,
  cost_inr double precision default 0.0,
  served_from_cache boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Escalations Table (Human Groundedness Gate Fallback)
create table if not exists public.escalations (
  id uuid primary key default gen_random_uuid(),
  query_id uuid references public.queries_log(id) on delete cascade,
  status text default 'open' check (status in ('open', 'in_progress', 'resolved')),
  assigned_dept text default 'Admissions & Central Admin Cell',
  admin_notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  resolved_at timestamp with time zone
);

-- 7. Rooms Table (Indoor Campus Navigation)
create table if not exists public.rooms (
  id uuid primary key default gen_random_uuid(),
  room_name text unique not null,
  building text not null,
  floor text not null,
  wing text not null,
  directions_text text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ==============================================================================
-- VECTOR MATCH RPC FUNCTIONS
-- ==============================================================================

-- A. Knowledge Base Cosine Similarity Search
create or replace function match_knowledge_base(
  query_embedding vector(384),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  category text,
  question text,
  answer text,
  source_document text,
  contact_if_unsure text,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    kb.id,
    kb.category,
    kb.question,
    kb.answer,
    kb.source_document,
    kb.contact_if_unsure,
    1 - (kb.embedding <=> query_embedding) as similarity
  from public.knowledge_base kb
  where kb.embedding is not null
    and 1 - (kb.embedding <=> query_embedding) > match_threshold
  order by kb.embedding <=> query_embedding
  limit match_count;
end;
$$;

-- B. Semantic Cache Cosine Similarity Search
create or replace function match_query_cache(
  query_embedding vector(384),
  match_threshold float default 0.95,
  match_count int default 1
)
returns table (
  id uuid,
  question_text text,
  cached_answer text,
  hit_count int,
  similarity float
)
language plpgsql
as $$
begin
  return query
  select
    qc.id,
    qc.question_text,
    qc.cached_answer,
    qc.hit_count,
    1 - (qc.question_embedding <=> query_embedding) as similarity
  from public.query_cache qc
  where 1 - (qc.question_embedding <=> query_embedding) >= match_threshold
  order by qc.question_embedding <=> query_embedding
  limit match_count;
end;
$$;

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

alter table public.users enable row level security;
alter table public.knowledge_base enable row level security;
alter table public.query_cache enable row level security;
alter table public.queries_log enable row level security;
alter table public.escalations enable row level security;
alter table public.rooms enable row level security;

-- Public read access for knowledge base & rooms (all students)
create policy "Allow all read knowledge base" on public.knowledge_base for select using (true);
create policy "Allow all read rooms" on public.rooms for select using (true);

-- Admin CRUD access
create policy "Admin full access knowledge base" on public.knowledge_base 
  for all using (auth.jwt() ->> 'email' like '%admin%' or auth.jwt() ->> 'email' like '%registrar%');

-- Students see their own query logs; Admins see all
create policy "Students view own query log" on public.queries_log
  for select using (auth.uid() = user_id or auth.jwt() ->> 'email' like '%admin%');

create policy "Allow insert queries log" on public.queries_log
  for insert with check (true);
