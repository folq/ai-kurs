# Spec 1: Cross-cutting UI & Folq Branding

**Date:** 2026-03-27
**Status:** Draft
**Scope:** Full Folq rebrand, theory/workshop tabs, model pricing display, Norwegian content

---

## Overview

Rebrand the AI-Kurs app to Folq's visual identity, add a theory/intro tab to every course page, display token usage and estimated cost for all LLM calls, and ensure model selectors are consistent across all pages.

## Decisions

| Decision | Choice |
|----------|--------|
| Branding depth | Full rebrand — colors, fonts, section accents |
| Tab structure | Two tabs: "Teori" + "Workshop" |
| Pricing strategy | Hardcoded price table in `model-selectors.ts` |
| Language | Norwegian for all theory/exercise content |
| Architecture | Shared `PageShell` component + CSS variable rebrand |

---

## 1. Color System

Remap shadcn's `:root` CSS variables in `src/styles/globals.css` to Folq equivalents.

### Variable Mapping

| shadcn variable | Folq color | Hex |
|---|---|---|
| `--background` | white | `#FFFFFF` |
| `--foreground` | gray-1100 | `#1A1919` |
| `--card` | gray-25 | `#FAFAFA` |
| `--card-foreground` | gray-1100 | `#1A1919` |
| `--popover` | white | `#FFFFFF` |
| `--popover-foreground` | gray-1100 | `#1A1919` |
| `--primary` | teal-600 | `#4D988A` |
| `--primary-foreground` | white | `#FFFFFF` |
| `--secondary` | gray-50 | `#F5F5F5` |
| `--secondary-foreground` | gray-1100 | `#1A1919` |
| `--muted` | gray-50 | `#F5F5F5` |
| `--muted-foreground` | gray-600 | `#636363` |
| `--accent` | teal-50 | `#EEF6F4` |
| `--accent-foreground` | gray-1100 | `#1A1919` |
| `--destructive` | tiger-lily-600 | `#DC583E` |
| `--border` | gray-100 | `#EBEBEB` |
| `--input` | gray-200 | `#D8D8D8` |
| `--ring` | teal-1200 | `#19564A` |

### Additional Folq Colors as Tailwind Utilities

Register these in the `@theme inline` block so they're available as utility classes beyond the shadcn variables:

- Full teal scale (teal-25 through teal-1200)
- Full tiger-lily scale
- Information blues (for structured outputs section accent)
- Cornflower blues (for embeddings section accent)
- Alert yellows (for warnings if needed)

### Homepage Section Accents

Replace generic Tailwind colors with Folq palette:

| Section | Background | Border |
|---------|-----------|--------|
| 1. Prompting | teal-50 `#EEF6F4` | teal-300 `#9CC8BF` |
| 2. Structured Outputs | information-25 `#EBF7FE` | information-300 `#9DD6FB` |
| 3. Embeddings | cornflower-100 `#EAEDF8` | cornflower-300 `#B1BFF8` |
| 4. Agent | tiger-lily-05 `#FDF0ED` | tiger-lily-200 `#F1A596` |

## 2. Typography

### Fonts

- **SangBleu Republic** — display/headings (page titles, section headers, nav brand name)
- **Helvetica Neue** (with Helvetica, Arial, sans-serif fallbacks) — body text, UI labels, inputs, badges
- Monospace stays unchanged for code blocks

### Implementation

- Host SangBleu Republic font files in `public/fonts/` (this is a proprietary Folq font, must be provided)
- Define `@font-face` rules in `globals.css`
- Map via `@theme inline`:
  - `--font-heading: 'SangBleuRepublic', Georgia, serif`
  - `--font-sans: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif`
- Apply `font-heading` to `h1`, `h2`, `h3`, and the nav brand
- Apply `font-sans` to `body` and all UI elements

## 3. PageShell Component

### File: `src/components/layout/PageShell.tsx`

A shared wrapper for all four course pages.

### Props

```typescript
interface PageShellProps {
  title: string;
  description: string;
  theory: React.ReactNode;
  children: React.ReactNode;
  defaultTab?: "teori" | "workshop";
}
```

### Behavior

- Renders the page title (h1, SangBleu Republic) and description above the tab bar
- Tab bar with "Teori" | "Workshop" — teal-600 underline on active tab
- `defaultTab` defaults to `"workshop"` so returning participants land on the interactive tool
- Tab state is stored in URL query param (`?tab=teori`) so it's shareable/bookmarkable
- Teori tab renders the `theory` prop
- Workshop tab renders `children`

### Teori Content Structure

Each page gets a companion theory component. Recommended pattern:

```
src/components/theory/PromptingTheory.tsx
src/components/theory/StructuredOutputsTheory.tsx
src/components/theory/EmbeddingsTheory.tsx
src/components/theory/AgentTheory.tsx
```

Each theory component follows a consistent structure:

1. **Introduksjon** — 2-3 paragraph overview
2. **Konsepter** — key concepts in a highlighted box (teal-50 background)
3. **Oppgaver** — numbered task list

### Theory Content (Norwegian)

#### Prompting

**Introduksjon:** Prompting handler om hvordan du kommuniserer med en LLM. Systemprompten setter rollens rammer, mens temperatur og max tokens styrer kreativitet og lengde.

**Konsepter:**
- System prompt — setter AI-ens rolle og oppførsel
- Temperatur — lav = forutsigbar, høy = kreativ
- Max tokens — begrenser lengden på svaret
- Modellvalg — ulike modeller har ulik styrke og pris

**Oppgaver:**
1. Endre prompten og observer hvordan svaret endres
2. Juster temperatur — sammenlign lav (0.1) vs høy (1.5)
3. Prøv å jailbreake AI-en
4. Endre prompten til å motstå jailbreaking
5. Bytt modell og se forskjellen i kvalitet og hastighet
6. Sammenlign modeller — hvilken synes du var best?

#### Structured Outputs

**Introduksjon:** Structured outputs lar deg tvinge en LLM til å returnere data i et bestemt format. Ved å bruke Zod-schemas kan du gå fra ustrukturert tekst til typet JSON.

**Konsepter:**
- Zod schemas — definerer forventet datastruktur
- Output.object() — tvinger LLM til å følge schema
- Type safety — output er typesikkert i TypeScript
- Data extraction — fra fritekst til strukturert data

**Oppgaver:**
1. Inkluder forskjellige datatyper i schema, se output endre seg
2. Sammenlign generering av hele objektet vs streaming
3. Lag et nytt schema fra scratch (eksempler gitt)
4. Vis det frem for sidemannen

#### Embeddings

**Introduksjon:** Embeddings er numeriske vektorer som fanger semantisk mening. Like konsepter gir like vektorer, noe som muliggjør søk basert på mening i stedet for nøkkelord.

**Konsepter:**
- Embeddings — tekst som tall-vektorer
- Cosine similarity — måler likhet mellom vektorer
- sqlite-vec — vektorsøk i SQLite
- Semantisk vs keyword — mening vs eksakte ord

**Oppgaver:**
1. Søk med naturlig språk og sammenlign semantisk vs keyword
2. Endre scoring-funksjon og observer endringer
3. Prøv søk der semantisk slår keyword, og omvendt

#### Agent

**Introduksjon:** En agent er en LLM som kan bruke verktøy. I stedet for bare å generere tekst, kan den søke i databaser, administrere favoritter, og kombinere flere steg for å løse oppgaver.

**Konsepter:**
- Tool calling — LLM velger og kaller funksjoner
- Agent loop — iterativ prosess med verktøybruk
- Multi-step — flere verktøykall i sekvens
- Tool composition — kombinere verktøy kreativt

**Oppgaver:**
1. Be agenten søke etter filmer og legg til favoritter
2. Observer verktøykallene — forstå hva agenten gjør
3. Prøv oppgaver som krever flere verktøy i sekvens
4. Bytt modell og se hvordan verktøybruk endres

## 4. UsageStats Component

### File: `src/components/shared/UsageStats.tsx`

A compact inline bar showing token usage, speed, and cost after every LLM response.

### Props

```typescript
interface UsageStatsProps {
  promptTokens: number;
  completionTokens: number;
  modelId: string;
  // For streaming: tokens per second
  tokensPerSecond?: number;
  // For non-streaming: total wall clock time in ms
  durationMs?: number;
}
```

### Display Format

**Streaming** (prompting, agent):
`↑ 342 in | ↓ 187 out | ⚡ 62.4 tok/s | $0.0001 | GPT-4o mini`

**Non-streaming** (structured outputs):
`↑ 856 prompt | ↓ 243 completion | ⏱ 1.8s | $0.0003 | GPT-4o mini`

### Styling

- Compact horizontal bar with gray-50 background, gray-100 border
- Pipe separators between sections
- Price in teal-600 (green, positive connotation for "cheap")
- Model name right-aligned in muted text

### Tokens/sec Measurement

**Streaming pages:** Client-side timing. Record `Date.now()` when the first streaming chunk arrives and when streaming completes. Calculate: `completionTokens / ((endTime - startTime) / 1000)`.

The Vercel AI SDK's `useChat` provides `onFinish` with usage data. For timing, we'll track `status` transitions: `streaming` start → `ready` end.

**Non-streaming pages:** Record wall-clock time around the fetch call. Display as total seconds rather than tok/s.

### Price Calculation

Returns `null` if model isn't in the pricing table (graceful fallback — just don't show price).

## 5. Model Pricing Data

### File: `src/lib/model-selectors.ts` (extend existing)

```typescript
export const MODEL_PRICING: Record<string, { input: number; output: number }> = {
  // Prices per 1M tokens (USD)
  "anthropic/claude-opus-4.6":           { input: 15.00, output: 75.00 },
  "openai/gpt-5.4":                      { input: 10.00, output: 30.00 },
  "google/gemini-3.1-pro-preview":       { input: 1.25,  output: 5.00 },
  "anthropic/claude-sonnet-4.6":         { input: 3.00,  output: 15.00 },
  "openai/gpt-4o":                       { input: 2.50,  output: 10.00 },
  "google/gemini-2.5-flash":             { input: 0.15,  output: 0.60 },
  "openai/gpt-4o-mini":                  { input: 0.15,  output: 0.60 },
  "anthropic/claude-haiku-4.5":          { input: 0.80,  output: 4.00 },
  "google/gemini-2.5-flash-lite":        { input: 0.075, output: 0.30 },
  "deepseek/deepseek-r1":               { input: 0.55,  output: 2.19 },
  "deepseek/deepseek-v3.2-speciale":    { input: 0.27,  output: 1.10 },
};

export function calculateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const pricing = MODEL_PRICING[modelId];
  if (!pricing) return null;
  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}
```

Prices are approximate and will need verification at implementation time.

## 6. Navigation Updates

### Brand

- Replace "AI-Kurs" text with "AI-Kurs" in SangBleu Republic, colored teal-1200
- Consider adding a small Folq logo if available

### Active State

- Active nav item: teal-600 background with white text (already the behavior with `--primary`, just inherits the new color)

## 7. Files Changed

### New Files

| File | Purpose |
|------|---------|
| `src/components/layout/PageShell.tsx` | Tab wrapper component |
| `src/components/shared/UsageStats.tsx` | Token/price display |
| `src/components/theory/PromptingTheory.tsx` | Norwegian theory content |
| `src/components/theory/StructuredOutputsTheory.tsx` | Norwegian theory content |
| `src/components/theory/EmbeddingsTheory.tsx` | Norwegian theory content |
| `src/components/theory/AgentTheory.tsx` | Norwegian theory content |
| `public/fonts/SangBleuRepublic-*` | Font files (must be provided) |

### Modified Files

| File | Changes |
|------|---------|
| `src/styles/globals.css` | Remap `:root` variables to Folq colors, add `@font-face`, extend `@theme inline` with Folq color utilities |
| `src/lib/model-selectors.ts` | Add `MODEL_PRICING` record and `calculateCost` helper |
| `src/pages/index.tsx` | Update section card colors to Folq palette |
| `src/pages/prompting.tsx` | Wrap in `PageShell`, add `UsageStats` to chat messages |
| `src/pages/structured-outputs.tsx` | Wrap in `PageShell`, replace token display with `UsageStats` |
| `src/pages/embeddings.tsx` | Wrap in `PageShell` |
| `src/pages/agent.tsx` | Wrap in `PageShell`, add `UsageStats` to chat messages |
| `src/components/layout/Navigation.tsx` | Update brand styling (font, color) |
| `src/app/api/prompting/chat/route.ts` | Return usage data in stream metadata |
| `src/app/api/agent/chat/route.ts` | Return usage data in stream metadata |

### Unchanged

- Database schema, seed script, embedding logic, API structure — no backend changes beyond streaming usage metadata
- Dark mode mapping can be done later (not in scope for this spec)

## 8. Out of Scope

- Dark mode Folq mapping (future spec)
- LLM-as-Judge (Spec 2)
- 3D embeddings visualization (Spec 3)
- Structured outputs enhancements (Spec 4)
- Agent/tools enhancements (Spec 4)
