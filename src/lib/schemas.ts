import { z } from "zod";

export const movieAnalysisSchema = z.object({
  title: z.string().describe("The title of the movie or show"),
  genres: z.array(z.string()).describe("List of genres"),
  themes: z.array(z.string()).describe("Key themes explored"),
  mood: z
    .enum(["dark", "light", "mixed", "intense", "whimsical"])
    .describe("Overall mood"),
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

export const schemas = {
  "Movie Analysis": {
    schema: movieAnalysisSchema,
    description: "Extract structured details from a movie or show description",
    exampleInput:
      "A lonely writer in near-future Los Angeles develops a relationship with an AI operating system. The film explores themes of love, loneliness, and what it means to be human in an increasingly digital world. It has beautiful cinematography and a melancholic soundtrack.",
  },
  "Review Sentiment": {
    schema: reviewSentimentSchema,
    description: "Analyze sentiment and key points from a review",
    exampleInput:
      "This show started incredibly strong with gripping performances and a tense atmosphere. However, by season 3, the writing became predictable and the characters lost their depth. The cinematography remained stunning throughout, but the plot holes became too large to ignore. Worth watching the first two seasons at least.",
  },
  "Content Advisory": {
    schema: contentAdvisorySchema,
    description: "Generate content warnings and age ratings",
    exampleInput:
      "An intense crime drama featuring graphic violence, drug use, and strong language throughout. The show depicts realistic portrayals of murder and torture. Some episodes deal with themes of mental illness and suicide. Not suitable for younger viewers.",
  },
} as const;

export type SchemaName = keyof typeof schemas;

export const schemaNameSchema = z.enum([
  "Movie Analysis",
  "Review Sentiment",
  "Content Advisory",
]);

export const analyzeBodySchema = z.object({
  text: z.string().min(1),
  schemaName: schemaNameSchema,
});
