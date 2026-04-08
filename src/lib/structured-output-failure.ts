import {
  JSONParseError,
  NoObjectGeneratedError,
  TypeValidationError,
} from "ai";
import { formatApiError, getErrorStatusCode } from "@/lib/format-api-error";
import { prepareModelJsonText } from "@/lib/thinking-json";

const MAX_MODEL_OUTPUT_LEN = 16_000;

function truncate(s: string, max: number): string {
  if (s.length <= max) return s;
  return `${s.slice(0, max)}…`;
}

function validationChainMessage(error: unknown): string | undefined {
  let e: unknown = error;
  for (let i = 0; i < 12 && e; i++) {
    if (e instanceof TypeValidationError) return e.message;
    if (e instanceof Error && e.message.includes("Type validation failed")) {
      return e.message;
    }
    e = e instanceof Error ? e.cause : undefined;
  }
  return undefined;
}

export type StructuredOutputErrorBody = {
  error: string;
  thinking?: string[];
  modelOutput?: string;
  validationMessage?: string;
};

/**
 * Build HTTP status + JSON body for structured-output failures (gateway, schema mismatch, thinking pollution, etc.).
 */
export function buildStructuredOutputErrorPayload(error: unknown): {
  status: number;
  body: StructuredOutputErrorBody;
} {
  const validationMessage = validationChainMessage(error);

  if (error instanceof NoObjectGeneratedError) {
    const thinking: string[] = [];
    let modelOutput: string | undefined;
    if (typeof error.text === "string" && error.text.length > 0) {
      const { thinkingSegments, jsonCandidate } = prepareModelJsonText(
        error.text,
      );
      thinking.push(...thinkingSegments);
      modelOutput = truncate(jsonCandidate, MAX_MODEL_OUTPUT_LEN);
    }

    const parts = [
      "Modellen returnerte ikke JSON som matcher det valgte skjemaet.",
      validationMessage,
    ].filter((p): p is string => Boolean(p?.trim()));

    return {
      status: 422,
      body: {
        error: parts.join("\n\n"),
        thinking: thinking.length > 0 ? thinking : undefined,
        modelOutput,
        validationMessage,
      },
    };
  }

  if (error instanceof TypeValidationError) {
    return {
      status: 422,
      body: {
        error: validationMessage ?? error.message,
        validationMessage: validationMessage ?? error.message,
      },
    };
  }

  if (error instanceof JSONParseError && typeof error.text === "string") {
    const { thinkingSegments, jsonCandidate } = prepareModelJsonText(
      error.text,
    );
    return {
      status: 422,
      body: {
        error:
          "Kunne ikke parse modellens svar som JSON (ofte pga. tenkeblokker eller ekstra tekst).",
        thinking: thinkingSegments.length > 0 ? thinkingSegments : undefined,
        modelOutput: truncate(jsonCandidate, MAX_MODEL_OUTPUT_LEN),
      },
    };
  }

  const status = getErrorStatusCode(error) ?? 500;
  return {
    status,
    body: {
      error: formatApiError(error),
      validationMessage: validationMessage ?? undefined,
    },
  };
}
