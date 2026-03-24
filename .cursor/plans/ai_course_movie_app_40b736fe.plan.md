---
name: AI Course Movie App
overview: Build a Next.js 16 TV/movie discovery app structured into 4 AI course sections (Prompting, Structured Outputs, Embeddings, Agent) with SQLite + sqlite-vec, Azure OpenAI via Vercel AI SDK, and shadcn/ui.
todos:
  - id: scaffold
    content: Scaffold Next.js 16 project, install deps (ai, @ai-sdk/azure, better-sqlite3, sqlite-vec, shadcn/ui, zod), configure Tailwind + layout + nav
    status: completed
  - id: db-seed
    content: Create SQLite schema (movies, movie_embeddings, favorites), seed script, movies.json with ~60 entries
    status: completed
  - id: lib-core
    content: 'Build core libs: db.ts, openai.ts, embeddings.ts, schemas.ts'
    status: completed
  - id: embeddings-page
    content: 'Build /embeddings page + API: semantic search, keyword search comparison, movie cards, favorites'
    status: completed
  - id: prompting-page
    content: 'Build /prompting page + API: streaming chat, system prompt editor, temperature/parameter controls'
    status: completed
  - id: structured-page
    content: 'Build /structured-outputs page + API: text input, schema selector, structured JSON output display'
    status: completed
  - id: agent-page
    content: 'Build /agent page + API: agent with tools (searchMovies, getMovieDetails, favorites, recommendSimilar), tool call display'
    status: completed
  - id: landing-polish
    content: Landing page with section cards, README, .env.local.example, final polish
    status: completed
isProject: false
---

# AI-Kurs: Movie Discovery Webapp

## Tech Stack

- Next.js 16, Pages Router, TypeScript
- Tailwind CSS + shadcn/ui
- SQLite via `better-sqlite3` + `sqlite-vec` (1536-dim embeddings)
- Vercel AI SDK v6 (`ai`, `@ai-sdk/azure`)
- Zod for schemas

## 4 Sections

1. **Prompting** (`/prompting`) -- Chat with editable system prompt + temperature slider
2. **Structured Outputs (**`/structured-outputs`**) -- Free text -> Zod-parsed JSON extraction**
3. **Embeddings (**`/embeddings`**) -- Seman**tic vs keyword search side-by-side
4. **Agent** (`/agent`) -- Conversational agent with tools (search, favorites, recommend)

## Database

- `movies` table, `movie_embeddings` vec0 virtual table, `favorites` table
- Seed script with ~60 movies/shows + embedding generation

## Key files

- `src/lib/db.ts` -- SQLite + schema init
- `src/lib/openai.ts` -- Azure OpenAI client
- `src/lib/embeddings.ts` -- embed + vector search
- `src/lib/schemas.ts` -- Zod schemas for structured outputs
- `src/lib/agent-tools.ts` -- tool definitions
- `scripts/seed.ts` + `scripts/movies.json`
