# Master Build Prompt — paste into Antigravity IDE (Agent mode)

> Use this as your first, big instruction. Then iterate screen by screen with the follow-up prompts in file 02.

---

Build a production-ready web app called **CampusSaarthi** — an AI assistant portal for IIM Lucknow students. Any student asks a question in plain language and gets an instant answer grounded ONLY in a curated campus knowledge base, with a visible source and confidence. Low-confidence questions are NOT answered by the model — they are routed to the Admin Cell.

## Stack (use exactly this)
- **Next.js 14** (App Router, TypeScript) — deploy target is **Vercel**
- **Supabase** for Postgres + Auth + **pgvector** (enable the `vector` extension)
- **Groq API** for LLM inference (model `llama-3.3-70b-versatile` for hard queries, `llama-3.1-8b-instant` for everyday queries)
- **Local embeddings** using `@xenova/transformers` with model `Xenova/all-MiniLM-L6-v2` (384-dim) — run in a Node API route, no external embedding key needed
- Tailwind CSS for styling
- Environment variables: `GROQ_API_KEY`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## Brand / design system
- Colours: deep maroon `#5C1220` (primary), brick red `#9E3A32`, gold `#C9A227` (accent), warm cream `#FBF7EF` (background), charcoal `#3B2E2A` (text), green `#3E7C59` (success), amber `#D98B2B` (escalation/warning)
- Fonts: a serif for the wordmark (e.g. Playfair Display), clean sans (Inter) for body
- Feel: warm, institutional, trustworthy. Rounded cards, soft shadows, mobile-first.
- App name shown as **CampusSaarthi**, tagline "Your campus guide".

## Database tables (create via SQL migration, enable pgvector)
- `users` (id uuid pk, email text unique, role text default 'student', created_at timestamptz)
- `knowledge_base` (id uuid pk, category text, question text, answer text, source_document text, contact_if_unsure text, embedding vector(384), created_at timestamptz, updated_at timestamptz)
- `query_cache` (id uuid pk, question_text text, question_embedding vector(384), cached_answer text, source_ids uuid[], hit_count int default 1, created_at timestamptz)
- `queries_log` (id uuid pk, user_id uuid, question text, answer_given text, confidence_score float, sources_used text[], was_escalated bool, model_used text, tokens_in int, tokens_out int, cost_inr float, served_from_cache bool default false, created_at timestamptz)
- `escalations` (id uuid pk, query_id uuid, status text default 'open', assigned_dept text, created_at timestamptz, resolved_at timestamptz)
Add an IVFFlat or HNSW index on the two vector columns for cosine distance.

## Core screens (build all)
1. **Login** — Supabase Google OAuth, restrict to `@iiml.ac.in` emails (reject others with a friendly message). Create/fetch the user row on first login.
2. **Chat** — the main screen. Input box, streaming answer, a green "Grounded in official source" badge, the source document name, a confidence indicator, and when escalated an amber "Routed to Admin Cell" card. Shows the signed-in student's recent questions in a side list.
3. **Indoor Navigator** — a screen where typing a room (e.g. "Hall 5") shows building → floor → wing and a simple step list. Data comes from a `rooms` table; a static floor-plan illustration is fine.
4. **Admin dashboard** — only for users with role 'admin'. CRUD on `knowledge_base` entries (re-embeds on save), a table of `queries_log`, and a list of open `escalations` to resolve.

## The RAG + cost pipeline (build it real, this is the important part)
On each question:
1. Embed the question locally with MiniLM (384-dim).
2. **Semantic cache check:** cosine-search `query_cache`. If best match > 0.95 similarity, return the cached answer, increment `hit_count`, log `served_from_cache = true`, and DO NOT call any model.
3. **Retrieve:** cosine-search `knowledge_base` for top 4 entries.
4. **Route:** if the top retrieval similarity is high (clear match) use `llama-3.1-8b-instant`; if borderline use `llama-3.3-70b-versatile`.
5. **Generate** with the strict grounding system prompt (see file 03). The model must answer ONLY from the retrieved entries and must output a JSON object `{answer, confidence, used_source, escalate}`.
6. **Groundedness gate:** if `escalate` is true OR confidence < 0.6 OR no retrieval cleared a minimum similarity, do NOT show the model answer — show the escalation card and create an `escalations` row.
7. **Log** everything to `queries_log` including estimated `cost_inr` (compute from Groq token usage; if Groq free tier, still log tokens and show an illustrative paise cost). Write good answers into `query_cache`.

## Deliverable
- Fully working, deployed to Vercel, connected to a live Supabase project.
- Seed the knowledge base from the provided `knowledge_base_seed.json` (write a seed script that embeds each entry and inserts it).
- Clean, responsive, demo-ready UI matching the brand.

Start by scaffolding the Next.js + Tailwind app, enabling Supabase with the SQL migration, and deploying an empty skeleton to Vercel. Then build screen by screen. Confirm the plan, then proceed.
