import { beforeEach, describe, expect, it, vi } from "vitest";

const storage = vi.hoisted(() => {
  const data = new Map<string, string>();
  const localStorage = {
    getItem: (k: string) => data.get(k) ?? null,
    setItem: (k: string, v: string) => void data.set(k, v),
    removeItem: (k: string) => void data.delete(k),
  };
  vi.stubGlobal("window", { localStorage, addEventListener: () => {}, removeEventListener: () => {} });
  return data;
});

import { localStorageRepository } from "@/lib/client/store";

let n = 0;
const freshKey = () => `test:${++n}`;

beforeEach(() => storage.clear());

describe("localStorageRepository", () => {
  it("starts from defaults when nothing is stored", () => {
    const s = localStorageRepository(freshKey(), false).load();
    expect(s).toMatchObject({ child: null, quiz: null, sessions: [], pro: false, plan: null, reminderTime: "19:30", demo: false });
    expect(s.anonId).toBeTruthy();
  });

  it("round-trips a saved state", () => {
    const repo = localStorageRepository(freshKey(), true);
    const s = repo.load();
    repo.save({ ...s, child: { name: "Leo", grade: "1" }, pro: true, plan: { id: "year", since: "2026-11-01" } });
    expect(repo.load()).toMatchObject({ child: { name: "Leo", grade: "1" }, pro: true, plan: { id: "year" }, demo: true });
    repo.clear();
    expect(repo.load().child).toBeNull();
  });

  it("drops fields that fail validation instead of trusting them", () => {
    const key = freshKey();
    storage.set(
      key,
      JSON.stringify({
        anonId: "abc",
        child: { name: "Leo", grade: "7" },
        quiz: { signs: "nope" },
        sessions: "x",
        plan: { id: "lifetime", since: "2026-11-01" },
        reminderTime: "7pm",
      }),
    );
    const s = localStorageRepository(key, false).load();
    expect(s).toMatchObject({ anonId: "abc", child: null, quiz: null, sessions: [], plan: null, reminderTime: "19:30" });
  });

  it("survives corrupt JSON", () => {
    const key = freshKey();
    storage.set(key, "{not json");
    expect(localStorageRepository(key, false).load().child).toBeNull();
  });
});
