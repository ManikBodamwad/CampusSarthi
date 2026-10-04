# CampusSaarthi — Technical Document
*(This is the markdown doc SynapsE Round 2 asks you to include in the project folder. Fill the bracketed bits after building. Keep it in the repo root as README or DOC.md.)*

## What it is
CampusSaarthi is an AI assistant portal for IIM Lucknow students. A student asks any campus question in plain language and gets an instant answer grounded only in the institute's own curated knowledge base, with the source shown. Questions it cannot answer with confidence are routed to the Admin Cell instead of being guessed.

## The problem (who faces it, how often)
Every incoming batch faces a ~2-month gap between the offer letter and joining with no official channel — only an unofficial WhatsApp group. The same document/fee/hostel/academic questions repeat endlessly, overloading seniors and, year-round, the admin and registrar inboxes. On arrival, new students cannot navigate the 200-acre campus. I lived this myself, which is how I conceptualised the portal.

## How it works under the hood

### Tech stack
- **Frontend + API:** Next.js 14 (App Router, TypeScript), Tailwind CSS
- **Hosting:** Vercel (frontend + serverless API routes)
- **Database + Auth:** Supabase (Postgres with the pgvector extension)
- **LLM:** Groq — `llama-3.1-8b-instant` for everyday queries, `llama-3.3-70b-versatile` for harder ones (tiered routing)
- **Embeddings:** local `Xenova/all-MiniLM-L6-v2` (384-dim), run in a Node route (no external embedding key)
- **Built with:** Antigravity IDE

### Main database tables
- `users` — id, email, role (student/admin), created_at
- `knowledge_base` — id, category, question, answer, source_document, contact_if_unsure, embedding vector(384), timestamps
- `query_cache` — id, question_text, question_embedding vector(384), cached_answer, source_ids, hit_count
- `queries_log` — id, user_id, question, answer_given, confidence_score, sources_used, was_escalated, model_used, tokens_in, tokens_out, cost_inr, served_from_cache
- `escalations` — id, query_id, status, assigned_dept, timestamps
- `rooms` — id, building, floor, wing, room_name, directions_text

### How login works
Supabase Auth with Google OAuth, restricted to `@iiml.ac.in` addresses. On first login a user row is created with role 'student'; admins are flagged manually. Row-level security enforces that students see only their own query history while admins see everything — access is enforced at the database layer, not just the UI.

### The request pipeline (per question)
1. Embed the question locally (MiniLM, 384-dim).
2. **Semantic cache:** cosine-search past questions; a >0.95 match returns the cached answer with zero model cost.
3. **Retrieve:** pgvector cosine search returns the top 4 knowledge-base entries.
4. **Route:** a clear match goes to the cheap 8B model; a borderline one escalates to the 70B model.
5. **Generate:** the model answers strictly from retrieved entries and returns JSON {answer, confidence, used_source, escalate}.
6. **Groundedness gate:** if escalate=true or confidence<0.6 or retrieval was weak, the model answer is suppressed and the question is routed to the Admin Cell.
7. **Log + cache:** tokens, cost, confidence, sources, and cache-hit are logged; good answers are cached.

### What happens under heavy load
- The semantic cache absorbs the pre-joining spike, since most of it is the same ~20 questions — these never hit a model.
- pgvector similarity search is indexed (IVFFlat/HNSW), sub-100ms at this scale.
- Vercel serverless auto-scales API routes; tiered routing keeps cost flat as volume rises.
- Per-user rate limiting guards against abuse.

### Cost (defensible, from published rates)
A grounded answer is ~1,500 input + ~300 output tokens. On published OpenAI-class rates a big-model answer is ~60 paise, a cheap-model answer ~4 paise, and a cached answer ~2 paise. With a realistic 60% cache / 35% cheap / 5% big mix, a 5,000-query peak month costs roughly ₹250–300 in model calls versus ~₹3,000 if every query hit the big model — about a 90% saving from caching plus routing. (Groq's free tier makes the demo itself effectively free; these figures show the economics at production scale.)

## Trade-offs I made with limited time
- [Fill: e.g. floor-plan is illustrative, not a live indoor-positioning system]
- [Fill: knowledge base seeded with 25 representative entries; production needs the registrar's full document set]
- [Fill: anything you simplified]

## How I'd handle integrity-testing situations
The app is designed to refuse rather than guess: anything personal, account-specific, or not clearly in the documents is escalated to a human, never answered speculatively. Student data is access-controlled at the DB layer and only the minimum is stored.

## Deployed at
[Fill: your Vercel URL]

## AI tools used in development
Built with Antigravity IDE. [Optionally list the key prompts — the prompt file in this folder documents them.]
