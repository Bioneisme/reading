"use client";

import Link from "next/link";
import { useAccount } from "@/lib/client/account";

export function AccountLink({ className = "" }: { className?: string }) {
  const account = useAccount();
  const signed = account.status === "signed";
  return (
    <Link href={signed ? "/journal" : "/signin"} className={`text-link text-[15px] font-extrabold text-ink-2 ${className}`}>
      {signed ? "My journal" : "Sign in"}
    </Link>
  );
}
