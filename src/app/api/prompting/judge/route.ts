import { generateText, Output } from "ai";
import { z } from "zod";
import { judgeBodSchema } from "@/lib/chat-api-schemas";
import { getModel } from "@/lib/openai";
import { validateRequest } from "@/lib/validate-api";

const judgeSchema = z.object({
  verdict: z
    .string()
    .describe("Overall evaluation comparing all model responses"),
  rankings: z.array(
    z.object({
      modelId: z.string(),
      rank: z.number().int().min(1),
      reasoning: z.string(),
    }),
  ),
});

const JUDGE_SYSTEM_PROMPT = `You are an impartial AI judge evaluating responses from different language models.
Your task is to compare their responses to a given prompt and rank them.

Consider:
- Relevance and accuracy of the response
- Quality of movie/TV recommendations if applicable
- Clarity and helpfulness of the writing
- Appropriate level of detail

Be fair and specific in your reasoning. Provide a clear verdict and rank each model.`;

export const POST = validateRequest(
  judgeBodSchema,
  async ({ prompt, responses, judgeModelId }) => {
    const candidateText = responses
      .map((r, i) => `### Model ${i + 1}: ${r.modelId}\n${r.text}`)
      .join("\n\n---\n\n");

    const judgePrompt = `## Original Prompt\n${prompt}\n\n## Model Responses\n\n${candidateText}\n\nPlease evaluate these responses, provide your verdict, and rank the models from best to worst.`;

    try {
      const { output } = await generateText({
        model: getModel(judgeModelId),
        system: JUDGE_SYSTEM_PROMPT,
        prompt: judgePrompt,
        output: Output.object({ schema: judgeSchema }),
        experimental_telemetry: { isEnabled: true },
      });

      return Response.json(output);
    } catch (error) {
      console.error("Judge error:", error);
      return Response.json(
        { error: "Failed to run judge evaluation" },
        { status: 500 },
      );
    }
  },
);
