import { describe, expect, it } from "vitest";
import { mergeStates, type SyncedState } from "@/lib/client/merge";
import type { SessionRecord } from "@/lib/engine";

const rec = (id: string, date: string, day = 1): SessionRecord => ({ id, date, day, kind: "nightly", words: [], misses: [] });
const state = (name: string | null, sessions: SessionRecord[], reminderTime = "19:30"): SyncedState => ({
  child: name ? { name, grade: "1" } : null,
  quiz: null,
  sessions,
  reminderTime,
});

describe("mergeStates", () => {
  it("keeps local progress when the account is empty", () => {
    const local = state("Leo", [rec("a", "2026-11-01")]);
    expect(mergeStates(local, null)).toBe(local);
    expect(mergeStates(local, state(null, []))).toBe(local);
  });

  it("restores the account on a fresh device", () => {
    const remote = state("Leo", [rec("a", "2026-11-01")], "20:00");
    expect(mergeStates(state(null, []), remote)).toBe(remote);
  });

  it("joins nights from both sides for the same child, ordered by date", () => {
    const merged = mergeStates(
      state("leo", [rec("b", "2026-11-03", 3), rec("a", "2026-11-01")]),
      state("Leo", [rec("a", "2026-11-01"), rec("c", "2026-11-02", 2)], "20:00"),
    );
    expect(merged.sessions.map((s) => s.id)).toEqual(["a", "c", "b"]);
    expect(merged.child?.name).toBe("Leo");
    expect(merged.reminderTime).toBe("20:00");
  });

  it("prefers the account when the children differ", () => {
    const remote = state("Ava", [rec("x", "2026-11-01")]);
    expect(mergeStates(state("Leo", [rec("a", "2026-11-02")]), remote)).toBe(remote);
  });
});
