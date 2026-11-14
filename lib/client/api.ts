import type { SkillId, Story, StoryToken } from "@/lib/engine";

export type PlanId = "week" | "month" | "year";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    let msg = `Request failed (${res.status})`;
    try {
      const body = (await res.json()) as { error?: string };
      if (body?.error) msg = body.error;
    } catch {
    }
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function createCheckout(plan: PlanId): Promise<{ url: string }> {
  const res = await fetch("/api/checkout", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ plan }),
  });
  const data = await json<{ url?: string }>(res);
  if (!data.url) throw new Error("No checkout URL returned");
  return { url: data.url };
}

export async function verifyCheckout(sessionId: string): Promise<{ paid: boolean }> {
  const res = await fetch(`/api/checkout/verify?session_id=${encodeURIComponent(sessionId)}`, {
    cache: "no-store",
  });
  const data = await json<{ paid?: boolean }>(res);
  return { paid: Boolean(data.paid) };
}

export async function generateStory(
  req: { focus: SkillId; allowed: SkillId[]; childName?: string },
  opts: { timeoutMs?: number } = {},
): Promise<{ story: Story; source: "llm" | "library"; tokens: StoryToken[] | null }> {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), opts.timeoutMs ?? 15000);
  try {
    const res = await fetch("/api/story", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ focus: req.focus, allowed: req.allowed }),
      signal: ctrl.signal,
    });
    const data = await json<{ story?: Story; source?: "llm" | "library"; tokens?: StoryToken[] }>(res);
    if (!data.story || typeof data.story.text !== "string") throw new Error("Bad story response");
    return {
      story: data.story,
      source: data.source ?? "library",
      tokens: Array.isArray(data.tokens) && data.tokens.length ? data.tokens : null,
    };
  } finally {
    clearTimeout(t);
  }
}

export async function fetchLexicon(words: string[]): Promise<Record<string, string[]>> {
  const unique = [...new Set(words.map((w) => w.toLowerCase()).filter((w) => /^[a-z']{1,30}$/.test(w)))].slice(0, 300);
  if (!unique.length) return {};
  try {
    const res = await fetch("/api/lexicon", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ words: unique }),
    });
    const data = await json<{ entries?: Record<string, string[]> }>(res);
    return data.entries ?? {};
  } catch {
    return {};
  }
}
