"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { store } from "@/lib/client/store";
import { DEMO_SESSIONS } from "@/lib/demo";

type LinkProps = { className?: string; children: ReactNode; "aria-label"?: string };

export function DemoLink({ to = "check", className, children, ...rest }: LinkProps & { to?: "check" | "result" }) {
  return (
    <Link
      href={to === "result" ? "/result" : "/check"}
      className={className}
      aria-label={rest["aria-label"]}
      onClick={() => {
        store.startDemo();
        if (to === "result") store.addSession({ ...DEMO_SESSIONS[0], date: new Date().toISOString() });
      }}
    >
      {children}
    </Link>
  );
}

export function RealLink({ href, className, children, ...rest }: LinkProps & { href: string }) {
  return (
    <Link href={href} className={className} aria-label={rest["aria-label"]} onClick={() => store.exitDemo()}>
      {children}
    </Link>
  );
}
