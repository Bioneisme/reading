import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import type { StoryDraft, StoryWriter } from "./story-service";

const Draft = z.object({ title: z.string(), text: z.string() });

const PRIMARY = "claude-sonnet-5-5";
const FAST = "claude-haiku-5-5";

export function createClaudeWriter(): StoryWriter | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  const client = new Anthropic({ timeout: 25_000, maxRetries: 0 });

  const call = async (model: string, prompt: string): Promise<StoryDraft> => {
    const res = await client.beta.messages.parse({
      model,
      max_tokens: 8000,
      ...(model === PRIMARY ? { betas: ["server-side-fallback-2026-07-01"], fallbacks: "default" as const } : {}),
      output_config: { effort: "medium", format: betaZodOutputFormat(Draft) },
      system: "You write tiny decodable stories for children who are learning to read. You follow word-list constraints exactly.",
      messages: [{ role: "user", content: prompt }],
    });
    if (res.stop_reason === "refusal" || !res.parsed_output) throw new Error(`no story (${res.stop_reason})`);
    return res.parsed_output;
  };

  return {
    async write(prompt) {
      try {
        return await call(PRIMARY, prompt);
      } catch (err) {
        if (err instanceof Anthropic.BadRequestError || err instanceof Anthropic.AuthenticationError) throw err;
        return call(FAST, prompt);
      }
    },
  };
}
