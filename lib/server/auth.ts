import "server-only";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { getDb } from "./db";

export const SESSION_COOKIE = "readly_session";
export const SESSION_TTL_MS = 90 * 24 * 60 * 60 * 1000;
const LOGIN_TTL_MS = 20 * 60 * 1000;
const LOGIN_LIMIT = 5;
const LOGIN_WINDOW_MS = 15 * 60 * 1000;

export interface User {
  id: string;
  email: string;
}

const hash = (token: string) => createHash("sha256").update(token).digest("hex");
const token = () => randomBytes(32).toString("base64url");

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function safeNext(next: string | null | undefined): string {
  if (!next || !next.startsWith("/") || next.startsWith("//") || next.includes("\\")) return "/journal";
  return next;
}

export function createLoginToken(email: string, next?: string | null, now = Date.now()): string | null {
  const db = getDb();
  const e = normalizeEmail(email);
  const recent = db
    .prepare("SELECT COUNT(*) AS n FROM login_tokens WHERE email = ? AND created_at > ?")
    .get(e, now - LOGIN_WINDOW_MS) as { n: number };
  if (recent.n >= LOGIN_LIMIT) return null;
  const t = token();
  db.prepare("INSERT INTO login_tokens (hash, email, next, created_at, expires_at) VALUES (?, ?, ?, ?, ?)").run(
    hash(t),
    e,
    safeNext(next),
    now,
    now + LOGIN_TTL_MS,
  );
  return t;
}

export function consumeLoginToken(t: string, now = Date.now()): { email: string; next: string } | null {
  const db = getDb();
  const row = db.prepare("SELECT email, next, expires_at, used_at FROM login_tokens WHERE hash = ?").get(hash(t)) as
    | { email: string; next: string | null; expires_at: number; used_at: number | null }
    | undefined;
  if (!row || row.used_at !== null || row.expires_at < now) return null;
  const res = db.prepare("UPDATE login_tokens SET used_at = ? WHERE hash = ? AND used_at IS NULL").run(now, hash(t));
  if (Number(res.changes) !== 1) return null;
  return { email: row.email, next: safeNext(row.next) };
}

export function upsertUser(email: string, now = Date.now()): User {
  const db = getDb();
  const e = normalizeEmail(email);
  db.prepare("INSERT OR IGNORE INTO users (id, email, created_at) VALUES (?, ?, ?)").run(randomUUID(), e, now);
  return db.prepare("SELECT id, email FROM users WHERE email = ?").get(e) as unknown as User;
}

export function createSession(userId: string, now = Date.now()): string {
  const t = token();
  getDb().prepare("INSERT INTO sessions (hash, user_id, expires_at) VALUES (?, ?, ?)").run(hash(t), userId, now + SESSION_TTL_MS);
  return t;
}

export function userFromSession(t: string | undefined | null, now = Date.now()): User | null {
  if (!t) return null;
  const row = getDb()
    .prepare("SELECT u.id AS id, u.email AS email, s.expires_at AS exp FROM sessions s JOIN users u ON u.id = s.user_id WHERE s.hash = ?")
    .get(hash(t)) as { id: string; email: string; exp: number } | undefined;
  if (!row || row.exp < now) return null;
  return { id: row.id, email: row.email };
}

export function deleteSession(t: string | undefined | null) {
  if (t) getDb().prepare("DELETE FROM sessions WHERE hash = ?").run(hash(t));
}

export function claimCheckout(checkoutId: string, userId: string, now = Date.now()): boolean {
  const res = getDb()
    .prepare("INSERT OR IGNORE INTO claimed_checkouts (id, user_id, created_at) VALUES (?, ?, ?)")
    .run(checkoutId, userId, now);
  return Number(res.changes) === 1;
}

export function getState(userId: string): { data: unknown; updatedAt: number } | null {
  const row = getDb().prepare("SELECT data, updated_at FROM states WHERE user_id = ?").get(userId) as
    | { data: string; updated_at: number }
    | undefined;
  if (!row) return null;
  try {
    return { data: JSON.parse(row.data), updatedAt: row.updated_at };
  } catch {
    return null;
  }
}

export function putState(userId: string, data: unknown, now = Date.now()) {
  getDb()
    .prepare(
      "INSERT INTO states (user_id, data, updated_at) VALUES (?, ?, ?) ON CONFLICT(user_id) DO UPDATE SET data = excluded.data, updated_at = excluded.updated_at",
    )
    .run(userId, JSON.stringify(data), now);
}
