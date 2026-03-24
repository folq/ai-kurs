# AI-Kurs: Movie Discovery App

A hands-on course webapp for learning AI in web development. Built around a movie/TV show discovery app, it covers four key AI concepts:

1. **Prompting** — Chat with configurable system prompts and parameters
2. **Structured Outputs** — Extract typed JSON from free text using Zod schemas
3. **Embeddings & Vector Search** — Semantic search vs keyword search side-by-side
4. **Agent with Tools** — Conversational agent that searches, recommends, and manages favorites

## Prerequisites

- Node.js 20.9+
- Azure OpenAI API access with deployments for:
  - `gpt-4o` (chat completion)
  - `text-embedding-3-small` (embeddings)

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy the example env file and fill in your Azure OpenAI credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your values:

```
AZURE_RESOURCE_NAME=your-resource-name
AZURE_API_KEY=your-api-key
AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com
AZURE_OPENAI_API_KEY=your-api-key
AZURE_OPENAI_DEPLOYMENT=gpt-4o
AZURE_OPENAI_EMBEDDING_DEPLOYMENT=text-embedding-3-small
```

### 3. Seed the database

This creates the SQLite database, inserts ~60 movies/shows, and generates embeddings for vector search:

```bash
npm run seed
```

The seed script will skip embedding generation if Azure credentials aren't set. You can re-run it after configuring `.env.local`.

### 4. Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
src/
  pages/              # Frontend pages (Pages Router)
    index.tsx         # Landing page with section overview
    prompting.tsx     # Section 1: Prompt engineering
    structured-outputs.tsx  # Section 2: Structured data extraction
    embeddings.tsx    # Section 3: Vector search
    agent.tsx         # Section 4: Agent with tools
    api/              # Data API routes (movies, favorites, search)
  components/         # React components organized by section
  lib/
    db.ts             # SQLite + sqlite-vec setup
    openai.ts         # Azure OpenAI client configuration
    embeddings.ts     # Embedding generation + vector search
    schemas.ts        # Zod schemas for structured outputs
    agent-tools.ts    # Tool definitions for the agent
  app/
    api/              # AI streaming routes (Route Handlers for AI SDK v6)
scripts/
  seed.ts             # Database seeding script
  movies.json         # Curated movie/show dataset
```

## Tech Stack

- **Next.js 16** (Pages Router) + TypeScript
- **Vercel AI SDK v6** (`ai`, `@ai-sdk/azure`)
- **SQLite** via `better-sqlite3` + `sqlite-vec` for vector search
- **Tailwind CSS** + **shadcn/ui** for the UI
- **Zod** for schema validation
