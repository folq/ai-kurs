import type { ZodType } from "zod";
import { z } from "zod";
import {
  DEFAULT_LANGUAGE_MODEL,
  languageModelSelectorSchema,
} from "@/lib/model-selectors";

const filmMoodEnum = z.enum([
  "dark",
  "light",
  "mixed",
  "intense",
  "whimsical",
  "melancholic",
]);

export const movieAnalysisSchema = z.object({
  title: z.string().describe("The title of the movie or show"),
  genres: z.array(z.string()).describe("List of genres"),
  themes: z.array(z.string()).describe("Key themes explored"),
  mood: filmMoodEnum.describe("Overall mood"),
  targetAudience: z.string().describe("Who would enjoy this"),
  similarTo: z.array(z.string()).describe("Similar well-known movies or shows"),
  summary: z.string().describe("A concise one-paragraph summary"),
  rating: z.number().min(1).max(10).describe("Estimated rating out of 10"),
});

export const reviewSentimentSchema = z.object({
  sentiment: z
    .enum(["very_positive", "positive", "mixed", "negative", "very_negative"])
    .describe("Overall sentiment of the review"),
  score: z.number().min(0).max(100).describe("Sentiment score 0-100"),
  pros: z.array(z.string()).describe("Positive aspects mentioned"),
  cons: z.array(z.string()).describe("Negative aspects mentioned"),
  keyQuotes: z.array(z.string()).describe("Notable quotes from the review"),
  recommendedFor: z
    .string()
    .describe("What type of viewer would appreciate this based on the review"),
});

export const contentAdvisorySchema = z.object({
  ageRating: z
    .enum(["G", "PG", "PG-13", "R", "NC-17"])
    .describe("Recommended age rating"),
  violence: z
    .enum(["none", "mild", "moderate", "strong", "extreme"])
    .describe("Level of violence"),
  language: z
    .enum(["none", "mild", "moderate", "strong"])
    .describe("Level of profanity"),
  themes: z.array(z.string()).describe("Mature themes present"),
  suitableForChildren: z.boolean(),
  parentalGuidanceNote: z.string().describe("Brief note for parents"),
});

/**
 * Root must be `z.object` for gateway/OpenAI `response_format`.
 * Use `z.union` for the nested branch (not `discriminatedUnion`): Zod emits JSON Schema `anyOf`;
 * `discriminatedUnion` becomes `oneOf`, which OpenAI rejects under a property (`classification`).
 */
export const contentClassificationSchema = z.object({
  classification: z.union([
    z.object({
      type: z.literal("review"),
      sentiment: z.enum([
        "very_positive",
        "positive",
        "mixed",
        "negative",
        "very_negative",
      ]),
      score: z.number().min(0).max(100),
      pros: z.array(z.string()),
      cons: z.array(z.string()),
    }),
    z.object({
      type: z.literal("synopsis"),
      title: z.string(),
      genre: z.string(),
      plotSummary: z.string(),
      characters: z.array(z.string()),
    }),
    z.object({
      type: z.literal("question"),
      topic: z.string(),
      intent: z.string(),
      suggestedAction: z.string(),
    }),
  ]),
});

/** String version literals for Gemini/Vertex; nested `z.union` avoids OpenAI `oneOf` under `analysis`. */
export const versionedAnalysisSchema = z.object({
  analysis: z.union([
    z.object({
      version: z.literal("1"),
      title: z.string(),
      rating: z.number().min(1).max(10),
    }),
    z.object({
      version: z.literal("2"),
      title: z.string(),
      rating: z.number().min(1).max(10),
      genres: z.array(z.string()),
      themes: z.array(z.string()),
      mood: filmMoodEnum,
    }),
    z.object({
      version: z.literal("3"),
      title: z.string(),
      rating: z.number().min(1).max(10),
      genres: z.array(z.string()),
      themes: z.array(z.string()),
      mood: filmMoodEnum,
      targetAudience: z.string(),
      contentWarnings: z.array(z.string()),
      similarTo: z.array(z.string()),
    }),
  ]),
});

export const schemas = {
  Filmanalyse: {
    schema: movieAnalysisSchema,
    description:
      "Hent ut strukturerte detaljer fra en film- eller seriebeskrivelse",
    exampleInput:
      "En ensom forfatter i et nær-fremtidig Los Angeles utvikler et forhold til et AI-operativsystem. Filmen utforsker temaer som kjærlighet, ensomhet og hva det betyr å være menneske i en stadig mer digital verden. Den har vakker kinematografi og et melankolsk lydspor.",
  },
  Sentimentanalyse: {
    schema: reviewSentimentSchema,
    description: "Analyser sentiment og nøkkelpunkter fra en anmeldelse",
    exampleInput:
      "Denne serien startet utrolig sterkt med gripende skuespill og en spent atmosfære. Men innen sesong 3 ble manuset forutsigbart og karakterene mistet dybden sin. Kinematografien forble imponerende gjennomgående, men plottehullene ble for store til å ignorere. Verdt å se de to første sesongene i det minste.",
  },
  Innholdsvarsel: {
    schema: contentAdvisorySchema,
    description: "Generer innholdsadvarsler og aldersgrenser",
    exampleInput:
      "Et intenst krimdrama med grafisk vold, narkotikabruk og sterkt språk gjennomgående. Serien viser realistiske skildringer av drap og tortur. Noen episoder tar opp temaer som psykisk sykdom og selvmord. Ikke egnet for yngre seere.",
  },
  Innholdsklassifisering: {
    schema: contentClassificationSchema,
    description:
      "Klassifiser input som anmeldelse, synopsis eller spørsmål med typespesifikke felt",
    exampleInput:
      "Hva bør jeg se hvis jeg likte Inception? Jeg er i humør for noe tankevridende med flott visuelt og et komplekst plott.",
  },
  "Versjonert analyse": {
    schema: versionedAnalysisSchema,
    description:
      "Analyser med økende detaljnivå — v1 (enkel), v2 (detaljert), v3 (omfattende)",
    exampleInput:
      "En ensom forfatter i et nær-fremtidig Los Angeles utvikler et forhold til et AI-operativsystem. Filmen utforsker temaer som kjærlighet, ensomhet og hva det betyr å være menneske.",
  },
} as const;

export type SchemaName = keyof typeof schemas;

/** Per-schema Zod root for `generateText` / `streamText` + `Output.object` (typed union over schemas). */
export const structuredOutputSchemaByName: Record<SchemaName, ZodType> = {
  Filmanalyse: movieAnalysisSchema,
  Sentimentanalyse: reviewSentimentSchema,
  Innholdsvarsel: contentAdvisorySchema,
  Innholdsklassifisering: contentClassificationSchema,
  "Versjonert analyse": versionedAnalysisSchema,
};

export const schemaNameSchema = z.enum([
  "Filmanalyse",
  "Sentimentanalyse",
  "Innholdsvarsel",
  "Innholdsklassifisering",
  "Versjonert analyse",
]);

export const analyzeBodySchema = z.object({
  text: z.string().min(1),
  schemaName: schemaNameSchema,
  modelId: languageModelSelectorSchema
    .optional()
    .default(DEFAULT_LANGUAGE_MODEL),
  thinking: z.boolean().optional().default(false),
});
