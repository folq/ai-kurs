type MaybeRichError = {
  message?: string;
  responseBody?: string;
  statusCode?: number;
  data?: { error?: { message?: string } };
  cause?: unknown;
};

function appendResponseBodyMessage(responseBody: string, out: string[]) {
  try {
    const j = JSON.parse(responseBody) as { error?: { message?: string } };
    if (j?.error?.message) out.push(j.error.message);
    else out.push(responseBody);
  } catch {
    out.push(responseBody);
  }
}

function visitError(e: unknown, depth: number, out: string[]) {
  if (depth > 6 || e == null) return;
  if (typeof e === "string") {
    out.push(e);
    return;
  }
  if (e instanceof Error) {
    const extra = e as MaybeRichError;
    if (e.message && e.message !== "[object Object]") {
      out.push(e.message);
    }
    if (typeof extra.responseBody === "string" && extra.responseBody.trim()) {
      appendResponseBodyMessage(extra.responseBody, out);
    }
    const dataMsg = extra.data?.error?.message;
    if (typeof dataMsg === "string" && dataMsg.trim()) {
      out.push(dataMsg);
    }
    visitError(e.cause, depth + 1, out);
    return;
  }
  if (typeof e === "object") {
    const o = e as MaybeRichError;
    if (typeof o.message === "string" && o.message.trim()) {
      out.push(o.message);
    }
    if (typeof o.responseBody === "string" && o.responseBody.trim()) {
      appendResponseBodyMessage(o.responseBody, out);
    }
    const dataMsg = o.data?.error?.message;
    if (typeof dataMsg === "string" && dataMsg.trim()) {
      out.push(dataMsg);
    }
    visitError(o.cause, depth + 1, out);
  }
}

/** Human-readable message from AI SDK / fetch errors (nested cause, responseBody JSON, etc.). */
export function formatApiError(error: unknown): string {
  const parts: string[] = [];
  visitError(error, 0, parts);
  const unique = [...new Set(parts.map((p) => p.trim()).filter(Boolean))];
  return unique.join("\n\n") || "Unknown error";
}

export function getErrorStatusCode(error: unknown): number | undefined {
  let e: unknown = error;
  let depth = 0;
  while (e && depth < 8) {
    if (typeof e === "object" && e !== null && "statusCode" in e) {
      const s = (e as { statusCode: unknown }).statusCode;
      if (typeof s === "number" && s >= 400 && s < 600) return s;
    }
    if (e instanceof Error) {
      e = e.cause;
      depth++;
    } else if (typeof e === "object" && e !== null && "cause" in e) {
      e = (e as { cause: unknown }).cause;
      depth++;
    } else {
      break;
    }
  }
  return undefined;
}
