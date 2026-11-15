import { beforeEach, describe, expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
process.env.DATABASE_PATH = ":memory:";
import {
  claimCheckout,
  consumeLoginToken,
  createLoginToken,
  createSession,
  deleteSession,
  getState,
  putState,
  safeNext,
  upsertUser,
  userFromSession,
} from "@/lib/server/auth";
import { resetDbForTests } from "@/lib/server/db";

beforeEach(() => resetDbForTests());

describe("magic link tokens", () => {
  it("works once and normalizes the email", () => {
    const t = createLoginToken("  Parent@Example.com ", "/journal")!;
    expect(consumeLoginToken(t)).toEqual({ email: "parent@example.com", next: "/journal" });
    expect(consumeLoginToken(t)).toBeNull();
  });

  it("expires after 20 minutes", () => {
    const now = Date.now();
    const t = createLoginToken("a@b.co", null, now)!;
    expect(consumeLoginToken(t, now + 21 * 60 * 1000)).toBeNull();
  });

  it("rejects unknown tokens", () => {
    expect(consumeLoginToken("nope")).toBeNull();
  });

  it("rate-limits to 5 links per 15 minutes per email", () => {
    const now = Date.now();
    for (let i = 0; i < 5; i++) expect(createLoginToken("a@b.co", null, now + i)).not.toBeNull();
    expect(createLoginToken("A@B.co", null, now + 10)).toBeNull();
    expect(createLoginToken("a@b.co", null, now + 16 * 60 * 1000)).not.toBeNull();
  });

  it("only redirects to local paths", () => {
    expect(safeNext("/plans")).toBe("/plans");
    expect(safeNext("//evil.com")).toBe("/journal");
    expect(safeNext("https://evil.com")).toBe("/journal");
    expect(safeNext(null)).toBe("/journal");
  });
});

describe("sessions and users", () => {
  it("upserts one user per email", () => {
    const a = upsertUser("Mom@Example.com");
    const b = upsertUser("mom@example.com");
    expect(a.id).toBe(b.id);
  });

  it("resolves a session to its user until it is deleted or expires", () => {
    const u = upsertUser("dad@example.com");
    const now = Date.now();
    const t = createSession(u.id, now);
    expect(userFromSession(t, now)).toEqual(u);
    expect(userFromSession(t, now + 91 * 24 * 3600 * 1000)).toBeNull();
    deleteSession(t);
    expect(userFromSession(t, now)).toBeNull();
    expect(userFromSession(undefined)).toBeNull();
  });

  it("lets a checkout sign someone in only once", () => {
    const u = upsertUser("payer@example.com");
    expect(claimCheckout("cs_test_1", u.id)).toBe(true);
    expect(claimCheckout("cs_test_1", u.id)).toBe(false);
  });

  it("stores and replaces a user's reading state", () => {
    const u = upsertUser("x@example.com");
    expect(getState(u.id)).toBeNull();
    putState(u.id, { sessions: [{ id: "1" }] });
    putState(u.id, { sessions: [{ id: "1" }, { id: "2" }] });
    expect(getState(u.id)?.data).toEqual({ sessions: [{ id: "1" }, { id: "2" }] });
  });
});
