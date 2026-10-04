# Setup checklist — do these before/while building

## Accounts & keys (all free tier)
- [ ] **Supabase** project created → copy Project URL, anon key, service_role key. In SQL editor run: `create extension if not exists vector;`
- [ ] **Groq** account → create an API key at console.groq.com (free). Note the model names: `llama-3.1-8b-instant`, `llama-3.3-70b-versatile`.
- [ ] **Vercel** account connected to your GitHub (deploy target).
- [ ] **Google OAuth** in Supabase: Authentication → Providers → Google → enable, add client id/secret (create in Google Cloud Console, add Supabase callback URL). For a fast demo you can also allow email-link login and skip the domain check temporarily, but keep the @iiml.ac.in gate for the real submission.

## .env.local
```
GROQ_API_KEY=...
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```
(Set the same four in Vercel → Project → Settings → Environment Variables before final deploy.)

## Order of operations (matches the step prompts)
1. Scaffold + deploy empty skeleton (prove the pipeline works end to end early).
2. DB migration (tables + pgvector + indexes + RLS).
3. Embeddings util + seed the 25 KB entries.
4. /api/ask pipeline (cache → retrieve → route → generate → gate → log).
5. Chat UI.
6. Auth gating.
7. Navigator.
8. Admin dashboard.
9. Analytics + polish.
10. Final Vercel deploy + smoke test.

## Demo script for the interview (have these 4 ready to show live)
1. **Grounded answer:** ask "Can I pay hostel fees in instalments?" → shows answer + source badge.
2. **Cached repeat:** ask the same question slightly reworded → served from cache, instant, zero cost (point to the cache-hit in admin log).
3. **Escalation / integrity:** ask something personal like "My fee payment failed, what do I do?" → routes to Admin Cell instead of guessing. This is your integrity moment.
4. **Navigator:** type "Hall 5" → building → floor → wing.

## Common gotchas
- `@xenova/transformers` first run downloads the model — warm it once at build/startup so the demo isn't slow on first question.
- pgvector distance: use cosine (`<=>`), and remember similarity = 1 - distance when you threshold at 0.95 / 0.6.
- Groq JSON: ask for JSON in the prompt and parse defensively (strip stray text, try/catch) — open models occasionally wrap JSON in prose.
- Vercel serverless has a payload/time limit; the local embedder is fine but keep the model singleton to avoid re-loading per request.
