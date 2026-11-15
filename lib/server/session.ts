import "server-only";
import { cookies } from "next/headers";
import type { NextResponse } from "next/server";
import { SESSION_COOKIE, SESSION_TTL_MS, userFromSession, type User } from "./auth";

export async function currentUser(): Promise<User | null> {
  const jar = await cookies();
  return userFromSession(jar.get(SESSION_COOKIE)?.value);
}

export async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value;
}

const secure = () => (process.env.SITE_URL ?? "").startsWith("https://");

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: secure(),
    sameSite: "lax",
    path: "/",
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, secure: secure(), sameSite: "lax", path: "/", maxAge: 0 });
}
