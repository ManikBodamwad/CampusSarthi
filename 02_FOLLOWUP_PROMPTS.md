# Follow-up prompts — use these one at a time, in order, after the master prompt

These keep the agent focused. Paste each only after the previous step works.

## Step 1 — Scaffold + deploy skeleton
"Scaffold the Next.js 14 TypeScript app with Tailwind and the maroon/gold brand theme. Create the login, chat, navigator, and admin routes as empty styled shells with the CampusSaarthi header. Set up the Supabase client (browser + server). Give me the exact `.env.local` keys I need to fill. Then walk me through deploying this skeleton to Vercel now."

## Step 2 — Database + migration
"Write the SQL migration that enables the `vector` extension and creates all tables (users, knowledge_base, query_cache, queries_log, escalations, rooms) with the vector(384) columns and cosine indexes. Add row-level security: students read/write only their own queries_log rows; admins read all. Give me the SQL to run in the Supabase SQL editor."

## Step 3 — Embeddings + seed
"Add `@xenova/transformers`. Create a server utility `embed(text)` that returns a 384-dim vector using Xenova/all-MiniLM-L6-v2, cached as a singleton. Write a seed script that reads knowledge_base_seed.json, embeds each entry's question, and inserts all rows. Run it and confirm the rows are in Supabase with embeddings."

## Step 4 — The RAG + cost API route
"Build the `/api/ask` route implementing the full pipeline: embed question → semantic cache check (>0.95 → return cached) → pgvector top-4 retrieval → tiered model routing (8b vs 70b based on top similarity) → Groq call with the strict grounding system prompt that returns JSON {answer, confidence, used_source, escalate} → groundedness gate (escalate if confidence<0.6 or weak retrieval) → log to queries_log with token counts and an INR cost estimate → cache good answers. Stream the answer to the client. Handle errors gracefully."

## Step 5 — Chat UI
"Build the chat screen to match the CampusSaarthi design: maroon header with CS avatar, user bubbles in maroon on the right, bot bubbles in white on the left with a green 'Grounded in [source]' badge and a confidence pill, and an amber 'Routed to Admin Cell' card when escalated. Stream the response. Show the student's recent questions in a left panel. Mobile-first."

## Step 6 — Auth gating
"Wire Supabase Google OAuth. On callback, reject any email not ending in @iiml.ac.in with a clean message. Create the user row on first login with role 'student'. Protect /chat, /navigator, /admin behind auth. Protect /admin behind role='admin'."

## Step 7 — Navigator
"Build the indoor navigator. Create a `rooms` table (building, floor, wing, room_name, directions_text) and seed a few rooms including Hall 5 (BG3, Floor 1, East Wing). Typing a room name shows the breadcrumb Campus > Building > Floor > Room, a simple floor-plan illustration with the room highlighted, and the step-by-step directions text."

## Step 8 — Admin dashboard
"Build the admin dashboard (role-gated): a table to create/edit/delete knowledge_base entries that re-embeds on save, a paginated view of queries_log with cost and cache-hit columns, and a list of open escalations with a 'mark resolved' action."

## Step 9 — Polish + analytics
"Add a small analytics strip on the admin dashboard: total questions, % served from cache, average confidence, total estimated cost, and number of escalations. Make the whole app responsive and demo-ready. Fix any console errors."

## Step 10 — Final deploy
"Set all environment variables in Vercel, redeploy, and give me the live URL. Confirm login, a grounded answer, a cached repeat, an escalation, and the navigator all work on the deployed site."
