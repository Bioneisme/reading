import type { Metadata } from "next";
import { Suspense } from "react";
import { SuccessScreen } from "@/components/plans/SuccessScreen";

export const metadata: Metadata = { title: "You're all set" };

export default function CheckoutSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-paper" />}>
      <SuccessScreen />
    </Suspense>
  );
}
