const THINKING_TAG_NAMES = [
  "think",
  "thinking",
  "redacted_thinking",
  "reasoning",
] as const;

/**
 * Remove common model "thinking" XML blocks and collect their inner text.
 */
export function stripThinkingBlocks(text: string): {
  cleaned: string;
  segments: string[];
} {
  const segments: string[] = [];
  let cleaned = text;
  for (const tag of THINKING_TAG_NAMES) {
    const pair = new RegExp(`<${tag}\\b[^>]*>([\\s\\S]*?)</${tag}>`, "gi");
    cleaned = cleaned.replace(pair, (_full, inner: string) => {
      const t = inner.trim();
      if (t) segments.push(t);
      return "";
    });
  }
  return { cleaned: cleaned.trim(), segments };
}

export function stripMarkdownCodeFences(text: string): string {
  let t = text.trim();
  if (t.startsWith("```")) {
    t = t.replace(/^```(?:json)?\s*/i, "");
    t = t.replace(/\s*```$/i, "");
  }
  return t.trim();
}

/**
 * First top-level balanced `{ ... }` substring (handles strings and escapes).
 */
export function extractBalancedJsonObject(text: string): string | null {
  const start = text.indexOf("{");
  if (start === -1) return null;
  let depth = 0;
  let inString = false;
  let escapeNext = false;
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (escapeNext) {
      escapeNext = false;
      continue;
    }
    if (c === "\\" && inString) {
      escapeNext = true;
      continue;
    }
    if (c === '"') {
      inString = !inString;
      continue;
    }
    if (inString) continue;
    if (c === "{") depth++;
    else if (c === "}") {
      depth--;
      if (depth === 0) return text.slice(start, i + 1);
    }
  }
  return null;
}

/** Strip thinking + fences, then isolate JSON object if needed. */
export function prepareModelJsonText(raw: string): {
  thinkingSegments: string[];
  jsonCandidate: string;
} {
  const { cleaned, segments } = stripThinkingBlocks(raw);
  const fenced = stripMarkdownCodeFences(cleaned);
  const balanced = extractBalancedJsonObject(fenced);
  return {
    thinkingSegments: segments,
    jsonCandidate: balanced ?? fenced.trim(),
  };
}
