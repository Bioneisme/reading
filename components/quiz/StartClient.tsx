"use client";

import { useStore } from "@/lib/client/store";
import { QuizFlow } from "./QuizFlow";

export function StartClient() {
  const snap = useStore();
  if (!snap) return <div className="min-h-dvh bg-paper" />;
  return <QuizFlow real={snap.real} />;
}
