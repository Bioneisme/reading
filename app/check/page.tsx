import type { Metadata } from "next";
import { CheckClient } from "@/components/check/CheckClient";

export const metadata: Metadata = {
  title: "Tonight's reading check",
  description: "A 3-minute reading check: your child reads one short text aloud while you tap the words they miss.",
};

export default function CheckPage() {
  return <CheckClient />;
}
