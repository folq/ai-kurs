# Spec 3: 3D Embeddings Visualization & Recommendation Engine

**Date:** 2026-03-27  
**Status:** Draft (design)  
**Scope:** Next.js AI workshop app — movie/TV discovery, embeddings workshop page  
**Context:** Existing `src/pages/embeddings.tsx` already provides semantic vs keyword search side-by-side, embedding model selector, and `MovieCard` components. Backend: `movie_embeddings` (sqlite-vec, 1536-dim `float[1536]`), `semanticSearch` / `keywordSearch` in `src/lib/embeddings.ts`.

---

## Overview

Add a **3D scatter visualization** of the embedding space (after PCA: 1536 → 3 dimensions) and a **recommendation flow**: selecting a movie highlights geometrically similar titles in the scene and lists them as cards. Layout is **dual view** — wide 3D canvas on the left, recommendation panel on the right, with an optional browse list under the 3D area — all in a new section **below** the existing search UI on the embeddings page.

Participants see how movies cluster by semantics, how search hits appear in space, and how nearest-neighbor recommendations align (or not) with human taste.

## Decisions

| Decision | Choice |
|----------|--------|
| Dimensionality reduction | **PCA** — simple, deterministic, suitable for workshop; runs server-side; result cacheable |
| 3D stack | **`three` + `@react-three/fiber` + `@react-three/drei`** — proper React lifecycle, hooks, and helpers (OrbitControls, `Html` labels, etc.) |
| Placement | New section on embeddings page under current search: **«Visualisering & Anbefalinger»** |
| Selection entry points | Click **dot in 3D** or **movie card** (list / panel) → same recommendation mode |
| Search ↔ 3D | When user runs search, **highlight** semantic (and/or keyword) result IDs in the 3D scatter |
| Similarity API | Dedicated **`POST /api/embeddings/similar`** using stored vectors + sqlite-vec (not only reusing text `semanticSearch` on description — ensures same embedding model space as DB) |
| PCA compute | Prefer **in-memory cache** after first build; optional library vs minimal TS implementation (see PCA section) |

---

## 1. API Design

### `GET /api/embeddings/all`

**Purpose:** Return every movie with **3D coordinates** for the scatter plot, plus fields needed for coloring, labels, and cards.

**Behavior:**

1. Load all rows from `movie_embeddings` joined with `movies` (id, title, genre, rating, year, type, poster if needed).
2. Build matrix \(N \times 1536\) from embedding blobs.
3. Run **PCA → 3 components** (server-side).
4. Return JSON array, e.g.:

```json
[
  {
    "id": 1,
    "title": "Example",
    "genre": "Drama",
    "rating": 8.2,
    "year": 2020,
    "type": "movie",
    "x": 0.12,
    "y": -0.45,
    "z": 0.03
  }
]
```

**Caching:**

- PCA is **deterministic** for a fixed dataset. Cache the computed `{ id → x,y,z }` (or full response) **in memory** on the server process.
- **Invalidate** when embeddings table / movie set changes (e.g. dev re-seed, future admin import). Simple approaches: process restart, explicit version key in env, or row count + max `updated_at` if added later.
- Dataset size (~100 movies) makes full PCA fast; cache is still recommended to avoid repeated work on every client load.

**Errors:** 500 with message if DB/read fails; 503 if PCA fails (should be rare).

**Query params (optional future):** `embeddingModel` if multiple vec tables exist — **out of scope** unless schema evolves; document as future hook.

---

### `POST /api/embeddings/similar`

**Purpose:** Rank movies by **cosine / vector distance** to a chosen movie’s stored embedding.

**Body:**

```json
{
  "movieId": 42,
  "limit": 8
}
```

**Behavior:**

1. Load embedding for `movieId` from `movie_embeddings`.
2. Query sqlite-vec **KNN** (same pattern as `semanticSearch`) with `limit + 1` and **filter out** the query movie from results.
3. Return ordered list with distance (and full movie fields needed for `MovieCard`), e.g.:

```json
{
  "movieId": 42,
  "similar": [
    { "id": 7, "title": "…", "distance": 0.12, "genre": "…", "rating": … }
  ]
}
```

**Note:** Using the **stored vector** keeps recommendations consistent with the 3D space (same model / table as PCA input). A fallback of calling `semanticSearch(movie.description)` is possible for demos but can diverge from indexed embeddings; **spec prefers vec query by movie id**.

**Validation:** `movieId` required; `limit` default (e.g. 8), capped (e.g. 20).

---

## 2. 3D Visualization Component Design

### Responsibilities

- Fetch `GET /api/embeddings/all` once (or when cache invalidates client-side via refetch).
- Render **scatter**: one mesh or instanced mesh per movie, **color by genre** (discrete palette; legend optional).
- **Hover:** show title (tooltip via `@react-three/drei` `Html` or 2D overlay from raycast hit).
- **Click dot:** set **selected movie id**, fetch `POST /api/embeddings/similar`, enter **recommendation mode** (see UX flow).
- **OrbitControls:** rotate, zoom, pan — from `drei`.
- **Search highlight:** props or context from parent — when `semanticResults` / `keywordResults` update, **emphasize** those IDs (e.g. larger scale, brighter emissive, ring) vs dimmed default style.

### Recommendation mode (visual)

- **Selected** dot: distinct color / scale / pulse.
- **K nearest neighbors** (same `limit` as API or fixed K for lines): draw **lines** from selected point to neighbor points (e.g. `Line` from drei or `BufferGeometry`).
- **Non-cluster dots:** reduced opacity or desaturation.

### Performance

- ~100 points: raw meshes acceptable; **instancedMesh** if count grows.
- **Lazy load** the 3D chunk (dynamic `import()` with `ssr: false`) to avoid SSR issues with WebGL.

### Accessibility / fallback

- Short note in UI: 3D requires WebGL; if canvas fails, panel + list still work.

---

## 3. Recommendation Engine UX Flow

1. **Idle:** Full scatter, genre colors; optional subtle legend.
2. **User searches (existing flow):** Result IDs passed to viz → **highlight** hits in 3D (both semantic and keyword sets may use different colors or shapes).
3. **User selects a movie:**
   - **From 3D:** click dot.
   - **From list:** click row/card in browse list below 3D (or from search results if wired).
4. **Recommendation mode:**
   - Call `POST /api/embeddings/similar`.
   - **3D:** selected + neighbors highlighted, lines to K neighbors, others dimmed.
   - **Right panel:** large **selected** `MovieCard`; below it, **similar** movies as cards (same component as elsewhere).
5. **Clear / change selection:** second click on empty space (optional), explicit «Tilbake» / clear button, or selecting another movie.

### Panel copy (Norwegian section title)

- Section: **«Visualisering & Anbefalinger»**
- Empty state: prompt to click a film or run search.

---

## 4. UI Layout

Below existing search controls and results:

```
┌─────────────────────────────────────────────────────────────────┐
│  Visualisering & Anbefalinger                                    │
├──────────────────────────────┬──────────────────────────────────┤
│                              │  Recommendation panel              │
│   3D scatter (flex-1)        │  - Selected movie (prominent)      │
│   OrbitControls              │  - Similar movies (cards)        │
│                              │                                  │
├──────────────────────────────┴──────────────────────────────────┤
│  Movies list / browse (full width under 3D row)                  │
└─────────────────────────────────────────────────────────────────┘
```

- **Left column:** ~60–70% width on desktop; min height ~400px.
- **Right column:** ~30–40%; scroll if many similar items.
- **Below:** horizontal scroll or grid of cards for **all movies** (lightweight: title + genre + year; click selects same as 3D).

Responsive: stack panel **under** canvas on small screens.

---

## 5. PCA Implementation (Server-Side)

**Goal:** Deterministic 3D positions for all movies.

**Steps:**

1. Load all embeddings from DB into `Float32Array` matrix \(N \times 1536\).
2. **Center:** subtract column means.
3. **Covariance** (conceptually \(X^T X / (N-1)\)); for efficiency with large \(d\), implementations often use **SVD on centered \(X\)** or iterative methods without forming full \(1536 \times 1536\) matrix if possible.
4. **Top 3 eigenvectors** (principal components): power iteration + deflation, or **use a small linear-algebra helper / lightweight PCA library** (acceptable for workshop velocity).
5. **Project:** each row dot top-3 eigenvectors → `(x, y, z)`.
6. **Normalize** optional: scale axes for nicer camera framing (e.g. unit variance per axis).

**Performance:** ~100 × 1536 is small; even per-request PCA is feasible; **in-memory cache** of final coordinates is still recommended.

---

## 6. Dependencies to Install

```text
three
@react-three/fiber
@react-three/drei
```

Add types if needed: `@types/three` (often pulled via `three` modern versions — verify project).

---

## 7. Theory Updates (`EmbeddingsTheory`)

Extend **Oppgaver** (numbered list) with:

4. Utforsk 3D-visualiseringen — se hvordan filmer grupperer seg  
5. Klikk på en film og se anbefalinger basert på vektornærhet  
6. Sammenlign anbefalinger med dine egne preferanser  

Optional short Teori paragraph: embeddings as geometry; PCA as linear projection; neighbors ≈ similar meaning (with caveats).

---

## 8. Files Changed / Created

| Path | Action |
|------|--------|
| `package.json` / lockfile | Add `three`, `@react-three/fiber`, `@react-three/drei` |
| `src/pages/api/embeddings/all.ts` | **New** — PCA + cache + JSON |
| `src/pages/api/embeddings/similar.ts` | **New** — KNN by movie embedding |
| `src/lib/pca.ts` (or `embeddings-pca.ts`) | **New** — PCA utilities (or thin wrapper around library) |
| `src/lib/embeddings.ts` | **Extend** — helpers to load all embeddings matrix / by id if not present |
| `src/components/embeddings/EmbeddingsScatter3D.tsx` (or similar) | **New** — R3F canvas, points, lines, highlights |
| `src/components/embeddings/RecommendationPanel.tsx` | **New** — selected + similar cards |
| `src/components/embeddings/MoviesBrowseList.tsx` | **New** (optional split) — list under 3D |
| `src/pages/embeddings.tsx` | **Edit** — new section, state (selected id, search highlight ids), dynamic import 3D |
| `src/components/theory/EmbeddingsTheory.tsx` | **Edit** — oppgave items 4–6 (+ optional theory blurb) |

Exact file names may be adjusted to match project conventions (`@/components/...`).

---

## 9. Out of Scope

- **t-SNE / UMAP** (non-linear layouts; heavier or non-deterministic defaults).
- **Real-time PCA** when user picks different embedding model without re-indexing (would require per-model tables or rebuild).
- **3D on server** (SSR rendering of WebGL).
- **Collaborative filtering** or hybrid recommenders (pure vector similarity only).
- **Animation** of PCA over time, or morphing between models.
- **Internationalization** of every new string beyond the agreed Norwegian section title / oppgave lines (workshop tool copy may stay English per existing Spec 1 rules — align with product owner).

---

## 10. Acceptance Criteria (Summary)

- [ ] `GET /api/embeddings/all` returns stable `x,y,z` per movie; cached across requests until invalidation.
- [ ] `POST /api/embeddings/similar` returns neighbors excluding self, ordered by distance.
- [ ] Embeddings page shows new section with 3D scatter + recommendation panel + browse list.
- [ ] Genre-colored dots; hover title; OrbitControls.
- [ ] Click dot or list item → panel + 3D highlight + lines to K neighbors; search results visibly distinct in 3D.
- [ ] EmbeddingsTheory lists oppgave 4–6.
- [ ] Dependencies installed; build and dev server succeed.
