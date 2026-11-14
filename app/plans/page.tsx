import type { Metadata } from "next";
import { Suspense } from "react";
import { PlansScreen } from "@/components/plans/PlansScreen";

export const metadata: Metadata = { title: "Choose a plan" };

export default function PlansPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <PlansScreen />
    </Suspense>
  );
}
