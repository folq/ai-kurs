# Cross-cutting UI & Folq Branding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebrand the AI-Kurs app to Folq's visual identity with teal/tiger-lily colors, SangBleu Republic + Helvetica Neue fonts, add theory/workshop tabs to every course page, and display token usage with estimated cost for all LLM calls.

**Architecture:** Remap shadcn's CSS variables to Folq colors in `globals.css`. Create a shared `PageShell` component for the Teori/Workshop tab structure used by all four course pages. Create a shared `UsageStats` component displaying tokens, tokens/sec, and cost. Add a `MODEL_PRICING` lookup table to `model-selectors.ts`.

**Tech Stack:** Next.js 16 (Pages Router), Tailwind CSS v4, shadcn/ui, Vercel AI SDK v6, TypeScript

**Spec:** `docs/superpowers/specs/2026-03-27-cross-cutting-ui-folq-branding-design.md`

---

## File Structure

### New Files

| File | Responsibility |
|------|---------------|
| `src/components/layout/PageShell.tsx` | Tab wrapper (Teori/Workshop) for course pages |
| `src/components/shared/UsageStats.tsx` | Compact bar showing tokens, tok/s, price |
| `src/components/theory/PromptingTheory.tsx` | Norwegian theory content for prompting |
| `src/components/theory/StructuredOutputsTheory.tsx` | Norwegian theory content for structured outputs |
| `src/components/theory/EmbeddingsTheory.tsx` | Norwegian theory content for embeddings |
| `src/components/theory/AgentTheory.tsx` | Norwegian theory content for agent |

### Modified Files

| File | Changes |
|------|---------|
| `src/styles/globals.css` | Remap `:root` CSS vars to Folq, add `@font-face`, extend `@theme inline` |
| `src/lib/model-selectors.ts` | Add `MODEL_PRICING`, `calculateCost`, `getModelLabel` |
| `src/components/layout/Navigation.tsx` | Folq brand styling (font, color) |
| `src/pages/index.tsx` | Section card colors to Folq palette |
| `src/pages/prompting.tsx` | Wrap in PageShell, add UsageStats |
| `src/pages/structured-outputs.tsx` | Wrap in PageShell, replace token display with UsageStats |
| `src/pages/embeddings.tsx` | Wrap in PageShell |
| `src/pages/agent.tsx` | Wrap in PageShell, add UsageStats |
| `src/app/api/prompting/chat/route.ts` | Add `sendUsage: true` to stream response |
| `src/app/api/agent/chat/route.ts` | Add `sendUsage: true` to stream response |

---

### Task 1: Remap CSS variables to Folq colors

**Files:**
- Modify: `src/styles/globals.css`

- [ ] **Step 1: Replace `:root` color variables**

Open `src/styles/globals.css` and replace the entire `:root` block with Folq-mapped values. Convert hex to OKLCH using an online converter or use hex directly (Tailwind v4 supports both). For simplicity, use hex values:

```css
:root {
  --background: #FFFFFF;
  --foreground: #1A1919;
  --card: #FAFAFA;
  --card-foreground: #1A1919;
  --popover: #FFFFFF;
  --popover-foreground: #1A1919;
  --primary: #4D988A;
  --primary-foreground: #FFFFFF;
  --secondary: #F5F5F5;
  --secondary-foreground: #1A1919;
  --muted: #F5F5F5;
  --muted-foreground: #636363;
  --accent: #EEF6F4;
  --accent-foreground: #1A1919;
  --destructive: #DC583E;
  --border: #EBEBEB;
  --input: #D8D8D8;
  --ring: #19564A;
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: oklch(0.985 0 0);
  --sidebar-foreground: oklch(0.145 0 0);
  --sidebar-primary: oklch(0.205 0 0);
  --sidebar-primary-foreground: oklch(0.985 0 0);
  --sidebar-accent: oklch(0.97 0 0);
  --sidebar-accent-foreground: oklch(0.205 0 0);
  --sidebar-border: oklch(0.922 0 0);
  --sidebar-ring: oklch(0.708 0 0);
}
```

- [ ] **Step 2: Add Folq color utilities to `@theme inline`**

Add the full Folq color scales to the `@theme inline` block so they're available as Tailwind utility classes (e.g., `bg-teal-600`, `text-tiger-lily-500`). Add after the existing `--radius-*` entries:

```css
  --color-teal-1200: #19564A;
  --color-teal-1100: #1F6154;
  --color-teal-1000: #27685C;
  --color-teal-900: #337266;
  --color-teal-800: #3D8073;
  --color-teal-700: #468E81;
  --color-teal-600: #4D988A;
  --color-teal-500: #5AA395;
  --color-teal-400: #7BB5AA;
  --color-teal-300: #9CC8BF;
  --color-teal-200: #BDDAD5;
  --color-teal-100: #DEEDEA;
  --color-teal-50: #EEF6F4;
  --color-teal-25: #F7FBFA;

  --color-tiger-lily-1000: #B93116;
  --color-tiger-lily-900: #C33B20;
  --color-tiger-lily-800: #CB472D;
  --color-tiger-lily-700: #D24F35;
  --color-tiger-lily-600: #DC583E;
  --color-tiger-lily-500: #E36147;
  --color-tiger-lily-400: #E76950;
  --color-tiger-lily-300: #EC8773;
  --color-tiger-lily-200: #F1A596;
  --color-tiger-lily-100: #F5C3B9;
  --color-tiger-lily-50: #F7CFC7;
  --color-tiger-lily-25: #FAE1DC;
  --color-tiger-lily-05: #FDF0ED;

  --color-information-1000: #146BA7;
  --color-information-900: #1774B2;
  --color-information-800: #1F7CBB;
  --color-information-700: #2B89C9;
  --color-information-600: #429CDA;
  --color-information-500: #68B8EF;
  --color-information-400: #83C8F7;
  --color-information-300: #9DD6FB;
  --color-information-200: #B1DEFC;
  --color-information-100: #C4E6FD;
  --color-information-50: #D8EEFD;
  --color-information-25: #EBF7FE;

  --color-cornflower-600: #7690FB;
  --color-cornflower-500: #91A6FC;
  --color-cornflower-400: #9FB1FC;
  --color-cornflower-300: #B1BFF8;
  --color-cornflower-200: #CBD6FB;
  --color-cornflower-100: #EAEDF8;

  --color-alert-1000: #AE8300;
  --color-alert-900: #F0B912;
  --color-alert-500: #FFD967;
  --color-alert-100: #FFF7E1;
```

- [ ] **Step 3: Verify the build compiles**

Run: `pnpm build` (or `npm run build`)
Expected: Build succeeds with no CSS errors.

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: remap CSS variables to Folq color palette"
```

---

### Task 2: Set up Folq typography

**Files:**
- Modify: `src/styles/globals.css`

**Prerequisite:** SangBleu Republic font files must be placed in `public/fonts/`. If font files are not available yet, use Georgia as a fallback and add a TODO comment. The plan proceeds with the fallback-safe approach.

- [ ] **Step 1: Add `@font-face` rules and update font variables**

At the top of `src/styles/globals.css` (after the imports, before `:root`), add:

```css
@font-face {
  font-family: 'SangBleuRepublic';
  src: url('/fonts/SangBleuRepublic-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'SangBleuRepublic';
  src: url('/fonts/SangBleuRepublic-Bold.woff2') format('woff2');
  font-weight: 700;
  font-style: normal;
  font-display: swap;
}
```

Then update the `@theme inline` block to set the font variables:

```css
  --font-sans: 'Helvetica Neue', Helvetica, Arial, 'Lucida Grande', sans-serif;
  --font-heading: 'SangBleuRepublic', Georgia, serif;
```

- [ ] **Step 2: Add heading font styles to `@layer base`**

Update the `@layer base` block in `globals.css`:

```css
@layer base {
  * {
    @apply border-border outline-ring/50;
  }
  body {
    @apply bg-background text-foreground;
  }
  html {
    @apply font-sans;
  }
  h1, h2, h3 {
    font-family: var(--font-heading);
  }
}
```

- [ ] **Step 3: Verify fonts load**

Run: `pnpm dev`
Open the app in a browser. Headings should use SangBleu Republic (or Georgia fallback). Body text should use Helvetica Neue.

- [ ] **Step 4: Commit**

```bash
git add src/styles/globals.css
git commit -m "style: add Folq typography — SangBleu Republic headings, Helvetica Neue body"
```

---

### Task 3: Update Navigation with Folq brand styling

**Files:**
- Modify: `src/components/layout/Navigation.tsx`

- [ ] **Step 1: Update the brand link**

In `src/components/layout/Navigation.tsx`, change the brand `<Link>` to use the heading font and teal color:

```tsx
<Link href="/" className="font-heading font-bold text-lg tracking-tight text-teal-1200">
  AI-Kurs
</Link>
```

Note: `font-heading` needs to be registered as a Tailwind utility. In `globals.css` `@theme inline`, the `--font-heading` variable is already set. Tailwind v4 auto-generates `font-heading` from `--font-heading`.

- [ ] **Step 2: Verify nav renders with teal brand color**

Run: `pnpm dev`
Check: The "AI-Kurs" text in the nav should be dark teal (#19564A). Active tab should be teal-600 (#4D988A) background.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navigation.tsx
git commit -m "style: update nav brand to Folq teal + heading font"
```

---

### Task 4: Update homepage section card colors

**Files:**
- Modify: `src/pages/index.tsx`

- [ ] **Step 1: Replace generic Tailwind colors with Folq palette**

In `src/pages/index.tsx`, update the `sections` array `color` properties:

```tsx
const sections = [
  {
    href: "/prompting",
    number: 1,
    title: "Prompting",
    description: "...",
    concepts: ["System Prompts", "Temperature", "Max Tokens", "Prompt Patterns"],
    color: "bg-teal-50 border-teal-300",
  },
  {
    href: "/structured-outputs",
    number: 2,
    title: "Structured Outputs",
    description: "...",
    concepts: ["Zod Schemas", "Output.object()", "Type Safety", "Data Extraction"],
    color: "bg-information-25 border-information-300",
  },
  {
    href: "/embeddings",
    number: 3,
    title: "Embeddings & Vector Search",
    description: "...",
    concepts: ["Embeddings", "Vector Similarity", "sqlite-vec", "Cosine Distance"],
    color: "bg-cornflower-100 border-cornflower-300",
  },
  {
    href: "/agent",
    number: 4,
    title: "Agent with Tools",
    description: "...",
    concepts: ["Tool Calling", "Agent Loop", "Multi-step", "Tool Composition"],
    color: "bg-tiger-lily-05 border-tiger-lily-200",
  },
];
```

Keep the descriptions and concepts exactly as they are — only change the `color` values.

- [ ] **Step 2: Verify homepage cards show Folq colors**

Run: `pnpm dev`
Check each card: teal, blue, purple-ish blue, salmon-pink backgrounds with matching borders.

- [ ] **Step 3: Commit**

```bash
git add src/pages/index.tsx
git commit -m "style: update homepage section cards to Folq color accents"
```

---

### Task 5: Add model pricing data and calculateCost helper

**Files:**
- Modify: `src/lib/model-selectors.ts`

- [ ] **Step 1: Add MODEL_PRICING and calculateCost**

At the bottom of `src/lib/model-selectors.ts`, add:

```typescript
export const MODEL_PRICING: Partial<Record<LanguageModelId, { input: number; output: number }>> = {
  "anthropic/claude-opus-4.6":        { input: 15.00, output: 75.00 },
  "openai/gpt-5.4":                   { input: 10.00, output: 30.00 },
  "google/gemini-3.1-pro-preview":    { input: 1.25,  output: 5.00 },
  "anthropic/claude-sonnet-4.6":      { input: 3.00,  output: 15.00 },
  "openai/gpt-4o":                    { input: 2.50,  output: 10.00 },
  "google/gemini-2.5-flash":          { input: 0.15,  output: 0.60 },
  "openai/gpt-4o-mini":               { input: 0.15,  output: 0.60 },
  "anthropic/claude-haiku-4.5":       { input: 0.80,  output: 4.00 },
  "google/gemini-2.5-flash-lite":     { input: 0.075, output: 0.30 },
  "deepseek/deepseek-r1":             { input: 0.55,  output: 2.19 },
  "deepseek/deepseek-v3.2-speciale":  { input: 0.27,  output: 1.10 },
};

export function calculateCost(
  modelId: string,
  promptTokens: number,
  completionTokens: number,
): number | null {
  const pricing = MODEL_PRICING[modelId as LanguageModelId];
  if (!pricing) return null;
  return (promptTokens * pricing.input + completionTokens * pricing.output) / 1_000_000;
}

export function getModelLabel(modelId: string): string {
  const option = LANGUAGE_MODEL_OPTIONS.find((o) => o.id === modelId);
  return option?.label ?? modelId;
}
```

- [ ] **Step 2: Verify types compile**

Run: `pnpm build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/lib/model-selectors.ts
git commit -m "feat: add model pricing table and calculateCost helper"
```

---

### Task 6: Create UsageStats component

**Files:**
- Create: `src/components/shared/UsageStats.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/shared/UsageStats.tsx`:

```tsx
import { calculateCost, getModelLabel } from "@/lib/model-selectors";

interface UsageStatsProps {
  promptTokens: number;
  completionTokens: number;
  modelId: string;
  tokensPerSecond?: number;
  durationMs?: number;
}

export function UsageStats({
  promptTokens,
  completionTokens,
  modelId,
  tokensPerSecond,
  durationMs,
}: UsageStatsProps) {
  const cost = calculateCost(modelId, promptTokens, completionTokens);
  const label = getModelLabel(modelId);

  return (
    <div className="flex items-center gap-3 px-3 py-1.5 bg-muted border border-border rounded-md text-xs text-muted-foreground flex-wrap">
      <span>
        <span className="text-muted-foreground/60">↑</span> {promptTokens} in
      </span>
      <span>
        <span className="text-muted-foreground/60">↓</span> {completionTokens} out
      </span>
      <span className="w-px h-3.5 bg-border" />
      {tokensPerSecond != null && (
        <span>
          <span className="text-muted-foreground/60">⚡</span>{" "}
          {tokensPerSecond.toFixed(1)} tok/s
        </span>
      )}
      {durationMs != null && tokensPerSecond == null && (
        <span>
          <span className="text-muted-foreground/60">⏱</span>{" "}
          {(durationMs / 1000).toFixed(1)}s
        </span>
      )}
      {(tokensPerSecond != null || durationMs != null) && (
        <span className="w-px h-3.5 bg-border" />
      )}
      {cost != null && (
        <span className="text-primary font-medium">
          ${cost < 0.0001 ? cost.toExponential(1) : cost.toFixed(4)}
        </span>
      )}
      <span className="ml-auto text-[10px] text-muted-foreground/60">{label}</span>
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/shared/UsageStats.tsx
git commit -m "feat: create UsageStats component for token/price display"
```

---

### Task 7: Create PageShell component

**Files:**
- Create: `src/components/layout/PageShell.tsx`

- [ ] **Step 1: Create the component**

Create `src/components/layout/PageShell.tsx`:

```tsx
import { useRouter } from "next/router";
import { useCallback, type ReactNode } from "react";

interface PageShellProps {
  title: string;
  description: string;
  theory: ReactNode;
  children: ReactNode;
  defaultTab?: "teori" | "workshop";
}

export function PageShell({
  title,
  description,
  theory,
  children,
  defaultTab = "workshop",
}: PageShellProps) {
  const router = useRouter();
  const activeTab = (router.query.tab as string) === "teori" ? "teori" : defaultTab;

  const setTab = useCallback(
    (tab: "teori" | "workshop") => {
      const query = { ...router.query };
      if (tab === "teori") {
        query.tab = "teori";
      } else {
        delete query.tab;
      }
      router.replace({ pathname: router.pathname, query }, undefined, {
        shallow: true,
      });
    },
    [router],
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{title}</h1>
        <p className="text-muted-foreground max-w-2xl">{description}</p>
      </div>

      <div className="flex gap-0 border-b-2 border-border mb-6">
        <button
          type="button"
          onClick={() => setTab("teori")}
          className={`px-5 py-2 text-sm font-medium transition-colors -mb-[2px] ${
            activeTab === "teori"
              ? "text-teal-1200 border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Teori
        </button>
        <button
          type="button"
          onClick={() => setTab("workshop")}
          className={`px-5 py-2 text-sm font-medium transition-colors -mb-[2px] ${
            activeTab === "workshop"
              ? "text-teal-1200 border-b-2 border-primary"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Workshop
        </button>
      </div>

      {activeTab === "teori" ? theory : children}
    </div>
  );
}
```

- [ ] **Step 2: Verify it compiles**

Run: `pnpm build`
Expected: No TypeScript errors.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/PageShell.tsx
git commit -m "feat: create PageShell with Teori/Workshop tab structure"
```

---

### Task 8: Create theory components

**Files:**
- Create: `src/components/theory/PromptingTheory.tsx`
- Create: `src/components/theory/StructuredOutputsTheory.tsx`
- Create: `src/components/theory/EmbeddingsTheory.tsx`
- Create: `src/components/theory/AgentTheory.tsx`

All theory components follow the same structure: Introduksjon, Konsepter (teal-50 box), Oppgaver (numbered list). Content is in Norwegian as defined in the spec.

- [ ] **Step 1: Create PromptingTheory**

Create `src/components/theory/PromptingTheory.tsx`:

```tsx
export function PromptingTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Prompting handler om hvordan du kommuniserer med en LLM. Systemprompten
          setter rollens rammer — den bestemmer hvordan AI-en oppfører seg, hvilken
          tone den bruker, og hva den fokuserer på. Parametere som temperatur og max
          tokens gir deg kontroll over kreativitet og lengde på svaret.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          I denne workshopen bruker vi en filmanbefalings-kontekst for å eksperimentere
          med ulike prompting-strategier. Du vil se hvordan små endringer i
          systemprompt eller parametere kan gi dramatisk forskjellige resultater.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>System prompt</strong> — Setter AI-ens rolle og oppførsel. Tenk på
            det som en stillingsbeskrivelse.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Temperatur</strong> — Lav (0.0–0.3) = forutsigbar og fokusert. Høy
            (0.8–2.0) = kreativ og variert. Standard er 0.7.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Max tokens</strong> — Begrenser lengden på svaret. Én token ≈ ¾ av
            et ord på engelsk.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Modellvalg</strong> — Ulike modeller har ulik styrke, hastighet og
            pris. Større modeller gir ofte bedre svar, men koster mer.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>Endre prompten og observer hvordan svaret endres</li>
            <li>Juster temperatur — sammenlign lav (0.1) vs høy (1.5)</li>
            <li>Prøv å jailbreake AI-en</li>
            <li>Endre prompten til å motstå jailbreaking</li>
            <li>Bytt modell og se forskjellen i kvalitet og hastighet</li>
            <li>Sammenlign modeller — hvilken synes du var best?</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 2: Create StructuredOutputsTheory**

Create `src/components/theory/StructuredOutputsTheory.tsx`:

```tsx
export function StructuredOutputsTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Structured outputs lar deg tvinge en LLM til å returnere data i et bestemt
          format. Ved å bruke Zod-schemas kan du gå fra ustrukturert tekst til typet
          JSON — med garanti for at outputen matcher strukturen du definerer.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          Dette er spesielt nyttig når du trenger å hente ut spesifikke felter fra
          fritekst, for eksempel å analysere en filmanmeldelse og hente ut sentiment,
          score, og nøkkelpunkter som separate, typesikre verdier.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>Zod schemas</strong> — Definerer forventet datastruktur med
            typer, enums, arrays og valideringsregler.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Output.object()</strong> — Tvinger LLM til å følge et gitt
            schema. Outputen er garantert å matche.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Type safety</strong> — Outputen er typesikker i TypeScript.
            Ingen manuell parsing eller validering nødvendig.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Data extraction</strong> — Fra fritekst til strukturert data.
            Fungerer som en intelligent parser.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>Inkluder forskjellige datatyper i schema, se output endre seg</li>
            <li>Sammenlign generering av hele objektet vs streaming</li>
            <li>Lag et nytt schema fra scratch (eksempler gitt)</li>
            <li>Vis det frem for sidemannen</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 3: Create EmbeddingsTheory**

Create `src/components/theory/EmbeddingsTheory.tsx`:

```tsx
export function EmbeddingsTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          Embeddings er numeriske vektorer som fanger semantisk mening i tekst. Like
          konsepter gir like vektorer, noe som muliggjør søk basert på mening i
          stedet for nøkkelord.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          I denne workshopen sammenligner du semantisk søk (embeddings + cosine
          similarity) med tradisjonelt keyword-søk (SQL LIKE). Du vil se at
          embeddings forstår konsepter og stemning, selv når de eksakte ordene
          ikke matcher.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>Embeddings</strong> — Tekst representert som tall-vektorer.
            Hvert ord, setning eller dokument blir en punkt i et høy-dimensjonalt
            rom.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Cosine similarity</strong> — Måler likhet mellom to vektorer
            basert på vinkelen mellom dem. 1.0 = identisk, 0.0 = ingen likhet.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>sqlite-vec</strong> — SQLite-utvidelse for vektorsøk. Gjør
            KNN-søk (K nearest neighbors) direkte i databasen.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Semantisk vs keyword</strong> — Semantisk søk forstår mening.
            Keyword-søk krever eksakte ord. Begge har styrker i ulike situasjoner.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>Søk med naturlig språk og sammenlign semantisk vs keyword</li>
            <li>Endre scoring-funksjon og observer endringer</li>
            <li>Prøv søk der semantisk slår keyword, og omvendt</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 4: Create AgentTheory**

Create `src/components/theory/AgentTheory.tsx`:

```tsx
export function AgentTheory() {
  return (
    <div className="max-w-2xl space-y-8">
      <section>
        <h2 className="text-xl font-bold mb-3">Introduksjon</h2>
        <p className="text-sm text-foreground/80 leading-relaxed">
          En agent er en LLM som kan bruke verktøy. I stedet for bare å generere
          tekst, kan den søke i databaser, administrere favoritter, og kombinere
          flere steg for å løse oppgaver.
        </p>
        <p className="text-sm text-foreground/80 leading-relaxed mt-3">
          Agenten i denne workshopen har tilgang til seks verktøy: søke filmer
          semantisk, hente detaljer, legge til og fjerne favoritter, liste
          favoritter, og finne lignende filmer. Den bestemmer selv hvilke verktøy
          den trenger for å svare på spørsmålet ditt.
        </p>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Konsepter</h2>
        <div className="bg-teal-50 rounded-lg p-5 space-y-2">
          <div className="text-sm leading-relaxed">
            <strong>Tool calling</strong> — LLM velger og kaller funksjoner basert
            på brukerens spørsmål. Den genererer argumenter som JSON.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Agent loop</strong> — Iterativ prosess: LLM tenker → kaller
            verktøy → leser resultat → tenker igjen → svarer (eller kaller flere
            verktøy).
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Multi-step</strong> — Komplekse oppgaver krever flere
            verktøykall i sekvens. Agenten planlegger og utfører steg for steg.
          </div>
          <div className="text-sm leading-relaxed">
            <strong>Tool composition</strong> — Kombinere verktøy kreativt. For
            eksempel: søk → hent detaljer → legg til favoritt, alt i én samtale.
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold mb-3">Oppgaver</h2>
        <div className="bg-card border border-border rounded-lg p-5">
          <ol className="list-decimal list-inside space-y-3 text-sm text-foreground/80">
            <li>Be agenten søke etter filmer og legg til favoritter</li>
            <li>Observer verktøykallene — forstå hva agenten gjør</li>
            <li>Prøv oppgaver som krever flere verktøy i sekvens</li>
            <li>Bytt modell og se hvordan verktøybruk endres</li>
          </ol>
        </div>
      </section>
    </div>
  );
}
```

- [ ] **Step 5: Verify all compile**

Run: `pnpm build`
Expected: No TypeScript errors.

- [ ] **Step 6: Commit**

```bash
git add src/components/theory/
git commit -m "feat: add Norwegian theory components for all course pages"
```

---

### Task 9: Enable usage data in streaming API routes

**Files:**
- Modify: `src/app/api/prompting/chat/route.ts`
- Modify: `src/app/api/agent/chat/route.ts`

The Vercel AI SDK v6 `toUIMessageStreamResponse()` does not send usage data to the client by default. You must opt in.

- [ ] **Step 1: Update prompting chat route**

In `src/app/api/prompting/chat/route.ts`, change:

```typescript
return result.toUIMessageStreamResponse();
```

to:

```typescript
return result.toUIMessageStreamResponse({ sendUsage: true });
```

This tells the SDK to include `usage` (with `inputTokens`/`outputTokens`) in the stream response metadata so the client can read it in `onFinish`.

- [ ] **Step 2: Update agent chat route**

Same change in `src/app/api/agent/chat/route.ts`:

```typescript
return result.toUIMessageStreamResponse({ sendUsage: true });
```

- [ ] **Step 3: Verify build**

Run: `pnpm build`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add src/app/api/prompting/chat/route.ts src/app/api/agent/chat/route.ts
git commit -m "feat: enable usage data in streaming API responses"
```

---

### Task 10: Wire up Prompting page with PageShell and UsageStats

(Depends on Task 9 — API routes must send usage data for UsageStats to work)

**Files:**
- Modify: `src/pages/prompting.tsx`

- [ ] **Step 1: Wrap page in PageShell**

In `src/pages/prompting.tsx`:

1. Add imports:
```tsx
import { PageShell } from "@/components/layout/PageShell";
import { UsageStats } from "@/components/shared/UsageStats";
import { PromptingTheory } from "@/components/theory/PromptingTheory";
```

2. The page currently wraps everything in `<div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">`. Replace that outer div with `PageShell`. Remove the existing `<div className="mb-6">` header block (title + description) since PageShell renders those.

The return should become:
```tsx
return (
  <PageShell
    title="1. Prompting"
    description="Eksperimenter med systemprompter og parametere for å se hvordan de påvirker AI-ens svar."
    theory={<PromptingTheory />}
  >
    <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-6">
      {/* existing sidebar + chat content, unchanged */}
    </div>
  </PageShell>
);
```

- [ ] **Step 2: Add usage stats tracking and display**

Add state for tracking streaming timing and usage:

```tsx
const [streamStats, setStreamStats] = useState<
  Map<string, { promptTokens: number; completionTokens: number; tokensPerSecond: number }>
>(new Map());
const streamStartRef = useRef<number | null>(null);
```

Track stream start time by watching `status`. Important: do NOT reset the ref to null when `status === "ready"` — let `onFinish` consume and clear it to avoid a race condition:

```tsx
useEffect(() => {
  if (status === "streaming" && streamStartRef.current === null) {
    streamStartRef.current = Date.now();
  }
}, [status]);
```

Use the `onFinish` callback in `useChat` to capture usage data. Note: AI SDK v6's `onFinish` receives an **options object** `{ message }`, not the message directly. Usage fields from `sendUsage: true` are `inputTokens`/`outputTokens` (not `promptTokens`/`completionTokens`):

```tsx
const { messages, sendMessage, status, setMessages } = useChat({
  transport,
  onFinish: ({ message }) => {
    const usage = (message as UIMessage & { usage?: { inputTokens: number; outputTokens: number } }).usage;
    const startTime = streamStartRef.current;
    streamStartRef.current = null;
    if (usage && startTime) {
      const elapsed = (Date.now() - startTime) / 1000;
      const tokPerSec = elapsed > 0 ? usage.outputTokens / elapsed : 0;
      setStreamStats((prev) => {
        const next = new Map(prev);
        next.set(message.id, {
          promptTokens: usage.inputTokens,
          completionTokens: usage.outputTokens,
          tokensPerSecond: tokPerSec,
        });
        return next;
      });
    }
  },
});
```

**Implementation note:** The exact shape of `usage` on the message depends on how the AI SDK exposes `sendUsage` data. At implementation time, check `@ai-sdk/react` types — usage may live on `message.metadata.usage` instead of `message.usage`. Adjust the destructuring path accordingly. Log `message` in `onFinish` to inspect the actual shape.

- [ ] **Step 3: Render UsageStats below assistant messages**

In the message rendering loop, after each assistant message's text parts, add:

```tsx
{message.role === "assistant" && streamStats.has(message.id) && (
  <UsageStats
    {...streamStats.get(message.id)!}
    modelId={modelId}
  />
)}
```

- [ ] **Step 4: Verify page works**

Run: `pnpm dev`
Navigate to `/prompting`. Check:
1. Teori/Workshop tabs work
2. Workshop tab shows the chat UI
3. After sending a message, UsageStats appears below the response (if usage data is available from the SDK)

- [ ] **Step 5: Commit**

```bash
git add src/pages/prompting.tsx
git commit -m "feat: wire prompting page with PageShell and UsageStats"
```

---

### Task 11: Wire up Structured Outputs page with PageShell and UsageStats

**Files:**
- Modify: `src/pages/structured-outputs.tsx`

- [ ] **Step 1: Wrap page in PageShell**

Add imports:
```tsx
import { PageShell } from "@/components/layout/PageShell";
import { UsageStats } from "@/components/shared/UsageStats";
import { StructuredOutputsTheory } from "@/components/theory/StructuredOutputsTheory";
```

Replace the outer container div and header with PageShell:
```tsx
return (
  <PageShell
    title="2. Structured Outputs"
    description="Bruk Zod-schemas for å hente ut strukturert, typet JSON fra fritekst."
    theory={<StructuredOutputsTheory />}
  >
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* existing content */}
    </div>
  </PageShell>
);
```

- [ ] **Step 2: Add timing and replace token display with UsageStats**

Add duration tracking state:
```tsx
const [durationMs, setDurationMs] = useState<number | null>(null);
```

In the `analyze` function, wrap the fetch call with timing:
```tsx
const startTime = Date.now();
const res = await fetch("/api/structured-outputs/analyze", { ... });
const data = await res.json();
setDurationMs(Date.now() - startTime);
```

Replace the existing token display (the `{usage && ...}` block near the bottom of the output card) with:
```tsx
{usage && (
  <div className="mt-4 pt-3 border-t">
    <UsageStats
      promptTokens={usage.promptTokens}
      completionTokens={usage.completionTokens}
      modelId={modelId}
      durationMs={durationMs ?? undefined}
    />
  </div>
)}
```

- [ ] **Step 3: Verify**

Run: `pnpm dev`
Navigate to `/structured-outputs`. Check:
1. Tabs work
2. After extracting data, the UsageStats bar appears with tokens, duration, and price

- [ ] **Step 4: Commit**

```bash
git add src/pages/structured-outputs.tsx
git commit -m "feat: wire structured outputs page with PageShell and UsageStats"
```

---

### Task 12: Wire up Embeddings page with PageShell

**Files:**
- Modify: `src/pages/embeddings.tsx`

- [ ] **Step 1: Wrap page in PageShell**

Add imports:
```tsx
import { PageShell } from "@/components/layout/PageShell";
import { EmbeddingsTheory } from "@/components/theory/EmbeddingsTheory";
```

Replace the outer container div and header with PageShell:
```tsx
return (
  <PageShell
    title="3. Embeddings & Vector Search"
    description="Søk etter filmer basert på mening, ikke bare nøkkelord."
    theory={<EmbeddingsTheory />}
  >
    {/* search bar, results, how-it-works card — all existing content */}
  </PageShell>
);
```

Note: No UsageStats on this page (embeddings don't return comparable usage data).

- [ ] **Step 2: Remove the duplicate container padding**

Since PageShell already provides `max-w-7xl mx-auto px-4 sm:px-6 py-8`, remove the outer wrapper that had the same classes. The content inside should start from the search bar.

- [ ] **Step 3: Verify**

Run: `pnpm dev`
Navigate to `/embeddings`. Check tabs work, search still functions.

- [ ] **Step 4: Commit**

```bash
git add src/pages/embeddings.tsx
git commit -m "feat: wire embeddings page with PageShell"
```

---

### Task 13: Wire up Agent page with PageShell and UsageStats

**Files:**
- Modify: `src/pages/agent.tsx`

- [ ] **Step 1: Wrap page in PageShell**

Add imports:
```tsx
import { PageShell } from "@/components/layout/PageShell";
import { UsageStats } from "@/components/shared/UsageStats";
import { AgentTheory } from "@/components/theory/AgentTheory";
```

Replace the outer container and header:
```tsx
return (
  <PageShell
    title="4. Agent"
    description="En samtalende agent med verktøy som binder alt sammen."
    theory={<AgentTheory />}
  >
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-6">
      {/* existing chat + sidebar */}
    </div>
  </PageShell>
);
```

- [ ] **Step 2: Add usage stats tracking (same pattern as prompting)**

Same streaming timing + `onFinish` pattern as Task 10 Step 2. Add state (`streamStats` Map, `streamStartRef`), track stream start in `useEffect`, capture usage in `onFinish: ({ message }) => { ... }` (destructured options object), and render `<UsageStats>` below assistant messages.

- [ ] **Step 3: Verify**

Run: `pnpm dev`
Navigate to `/agent`. Check tabs work, chat functions, UsageStats appears.

- [ ] **Step 4: Commit**

```bash
git add src/pages/agent.tsx
git commit -m "feat: wire agent page with PageShell and UsageStats"
```

---

### Task 14: Final verification and cleanup

- [ ] **Step 1: Full build check**

Run: `pnpm build`
Expected: Build succeeds with no errors.

- [ ] **Step 2: Lint check**

Run: `pnpm lint`
Expected: No new lint errors.

- [ ] **Step 3: Visual walkthrough**

Run: `pnpm dev` and check each page:
1. **Homepage** — Folq section colors, teal brand in nav
2. **Prompting** — Teori/Workshop tabs, teal buttons, UsageStats
3. **Structured Outputs** — Tabs, UsageStats replaces old token display
4. **Embeddings** — Tabs, search works
5. **Agent** — Tabs, chat works, UsageStats
6. **All pages** — Heading font is SangBleu Republic (or Georgia fallback), body is Helvetica Neue

- [ ] **Step 4: Commit any cleanup**

```bash
git add -A
git commit -m "chore: final cleanup for Folq branding implementation"
```
