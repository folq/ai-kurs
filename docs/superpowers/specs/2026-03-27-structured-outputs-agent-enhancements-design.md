# Spec 4: Structured Outputs & Agent Enhancements

**Date:** 2026-03-27  
**Status:** Draft  
**Scope:** Discriminated-union and versioned schemas, streaming vs full structured generation, Teori-tab exercises (Structured Outputs + Agent)

---

## Overview

The workshop app’s **Structured Outputs** page (`src/pages/structured-outputs.tsx`) already offers three flat Zod schemas (Movie Analysis, Review Sentiment, Content Advisory), `generateText` + `Output.object()` via `POST /api/structured-outputs/analyze`, formatted/raw views, and `UsageStats`. The **Agent** page (`src/pages/agent.tsx`) already provides chat with tool calls, a favorites sidebar, and a model selector.

This spec adds **two teaching-focused schemas** (discriminated unions + schema versioning), a **Streaming / Full** comparison mode using the AI SDK’s structured streaming API, and **Teori-only** updates for the agent module—no major agent UI or tool changes.

---

## Decisions

| Decision | Choice |
|----------|--------|
| Audience | Workshop participants; keep scope small and implementable in one session |
| New schemas | Exactly two: **Content Classification** (discriminated union on `type`) and **Versioned Analysis** (discriminated union on numeric `version`) |
| Streaming API | New route `POST /api/structured-outputs/stream` using `streamObject` (AI SDK); client consumes the stream and updates JSON incrementally |
| Full generation | Keep existing `POST /api/structured-outputs/analyze` pattern (`generateText` + `Output.object()`); extend it for the new schema names |
| Agent work | **Theory content only**—refine Oppgaver in `AgentTheory`; no new tools, routes, or sidebar behavior |
| UI language | Workshop labels stay English; Teori stays Norwegian (existing convention) |

---

## 1. New schemas (Structured Outputs page)

Schemas must be defined once in `src/lib/schemas.ts` (and mirrored for display in `src/pages/structured-outputs.tsx` as today: `description`, `exampleInput`, `zodCode` string for the panel). Extend `schemaNameSchema`, `schemas`, and the API switch / validation to include both names.

### 1.1 Content Classification

**Purpose:** Show a **discriminated union** where the model first classifies input, then fills **variant-specific** fields.

**Discriminator:** `type` with literals `"review"` | `"synopsis"` | `"question"`.

| `type` | Fields |
|--------|--------|
| `review` | `sentiment`, `score`, `pros`, `cons` |
| `synopsis` | `title`, `genre`, `plotSummary`, `characters` |
| `question` | `topic`, `intent`, `suggestedAction` |

**Zod pattern (illustrative):** `z.discriminatedUnion("type", [ z.object({ type: z.literal("review"), ... }), ... ])`.

**Example inputs (workshop hints):**

- Review-like text → expect `type: "review"`.
- Plot-heavy description → `type: "synopsis"`.
- “What should I watch if I liked X?” → `type: "question"`.

### 1.2 Versioned Analysis

**Purpose:** Show **schema evolution** and backward-compatible shapes using a **version** discriminator.

**Discriminator:** `version` with literals `1` | `2` | `3`.

| `version` | Fields |
|-----------|--------|
| `1` | `title`, `rating` |
| `2` | above + `genres`, `themes`, `mood` |
| `3` | above + `targetAudience`, `contentWarnings`, `similarTo` |

**Zod pattern:** `z.discriminatedUnion("version", [ z.object({ version: z.literal(1), ... }), ... ])`.

**Teaching note:** Same prompt can target different versions so participants see how adding fields changes output without breaking the union.

---

## 2. Streaming vs non-streaming comparison mode

### 2.1 UI

On `src/pages/structured-outputs.tsx`, add a clear control:

- **Labeling:** `Streaming` vs `Full` (or “Full” as single-shot completion).
- Placement: near **Model** / **Schema** (same card is fine)—must be visible before running extraction.
- **Full:** unchanged UX today—POST to `/api/structured-outputs/analyze`, show result when complete; `UsageStats` when usage is available.
- **Streaming:** POST to `/api/structured-outputs/stream`, update the output panel as partial objects arrive (raw JSON string and/or formatted view reflecting latest partial).

**Empty / error states:** Match existing patterns; streaming errors should surface in the UI without leaving a stuck “loading” state.

### 2.2 Behavior

| Mode | Mechanism | Teaching goal |
|------|-----------|----------------|
| Full | `generateText` + `Output.object({ schema })` | Simple, atomic JSON; good when you need the whole object before acting |
| Streaming | `streamObject({ model, schema, prompt })` | Progressive disclosure; good for responsive UIs and perceived latency |

**Usage / duration:** If the stream route returns usage only at the end, wire `UsageStats` when the stream completes; document any limitation in code comments if usage is incomplete mid-stream.

### 2.3 Formatted view + unions

The current formatted renderer flattens `Object.entries(output)`. Discriminated unions may nest objects or vary keys by variant:

- **Minimum:** Raw JSON view must remain correct for all schemas.
- **Stretch (optional in implementation):** shallow formatting that handles nested objects/arrays for union results without breaking existing flat schemas.

---

## 3. API changes

### 3.1 New route: `POST /api/structured-outputs/stream`

- **File:** `src/app/api/structured-outputs/stream/route.ts` (new).
- **Body:** Same shape as analyze where possible: `{ text, schemaName, modelId? }`—reuse or extend `analyzeBodySchema` / shared Zod types so `schemaName` includes the two new names.
- **Implementation:** `streamObject` from the AI SDK with the same per-schema Zod definitions as the analyze route; return a streaming response appropriate for the framework (e.g. `toTextStreamResponse()` or the project’s established AI SDK streaming pattern—align with `node_modules` AI package version in repo).
- **Errors:** 500 with JSON error body on failure; validate input with `validateRequest` for parity with `analyze`.

### 3.2 Existing route: `POST /api/structured-outputs/analyze`

- **File:** `src/app/api/structured-outputs/analyze/route.ts`.
- Add `case` branches (or shared mapping) for **Content Classification** and **Versioned Analysis**, each calling `generateText` with `Output.object({ schema: ... })`.

---

## 4. Updated theory content (Teori tab)

### 4.1 `StructuredOutputsTheory` (`src/components/theory/StructuredOutputsTheory.tsx`)

**Konsepter (suggested additions—short bullets):**

- **Discriminated union** — én felles nøkkel (`type` / `version`) bestemmer hvilke felter som finnes; nyttig når én prompt kan gi ulike “former” på svaret.
- **Streaming structured output** — `streamObject` bygger JSON gradvis; sammenlign med “alt på en gang” når du diskuterer UX og robusthet.

**Oppgaver:** Behold eksisterende punkter 1–4, og **legg til**:

5. Prøv discriminated union-schemat — se hvordan AI-en klassifiserer ulik input.  
6. Sammenlign streaming vs full generering — når er hva best?  
7. Lag et eget schema og test det.

*(Valgfritt: slå sammen eldre punkt 2 med nytt punkt 6 hvis listen føles redundant — da behold én tydelig formulering om streaming vs full.)*

### 4.2 `AgentTheory` (`src/components/theory/AgentTheory.tsx`)

**Oppgaver — legg til** etter eksisterende 1–4:

5. Prøv å gi agenten en kompleks oppgave som krever planlegging.  
6. Observer hvordan ulike modeller håndterer verktøyvalg forskjellig.

**Intro / Konsepter:** Liten presisering at planlegging og modellvalg påvirker rekkefølge og antall verktøykall — ingen nye komponenter nødvendig.

---

## 5. Files changed / created

| Path | Action |
|------|--------|
| `src/lib/schemas.ts` | Add Zod schemas + union types; extend `schemaNameSchema` / `schemas` |
| `src/pages/structured-outputs.tsx` | New schema entries in `SCHEMAS`; Streaming/Full toggle; fetch or `useObject`-style consumer for stream route; loading/error handling |
| `src/app/api/structured-outputs/analyze/route.ts` | Handle new `schemaName` values |
| `src/app/api/structured-outputs/stream/route.ts` | **Create** — `streamObject` endpoint |
| `src/components/theory/StructuredOutputsTheory.tsx` | Konsepter + Oppgaver 5–7 |
| `src/components/theory/AgentTheory.tsx` | Oppgaver 5–6 (teori) |

**Tests / manual checks:** Run through each schema in both modes; verify invalid body returns 4xx from shared validation.

---

## 6. Out of scope

- New agent tools, system prompts, or favorites behavior  
- Changing the agent API routes or chat transport  
- Internationalizing Workshop UI to Norwegian  
- Additional schemas beyond **Content Classification** and **Versioned Analysis**  
- Server-sent events for non-structured chat on other pages  
- Persisting streamed partials or replay history  
- Automatic migration of old JSON outputs (workshop app has no persistence requirement)

---

## References (current codebase)

- Workshop page: `src/pages/structured-outputs.tsx`  
- Analyze API: `src/app/api/structured-outputs/analyze/route.ts`  
- Shared schemas: `src/lib/schemas.ts`  
- Teori: `src/components/theory/StructuredOutputsTheory.tsx`, `src/components/theory/AgentTheory.tsx`
