"use client";

import { useEffect } from "react";
import { startSync } from "@/lib/client/account";

export function AccountSync() {
  useEffect(() => {
    void startSync();
    const onFocus = () => void startSync();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);
  return null;
}
