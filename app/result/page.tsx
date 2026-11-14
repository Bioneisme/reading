import type { Metadata } from "next";
import { ResultScreen } from "@/components/result/ResultScreen";

export const metadata: Metadata = { title: "Results" };

export default function ResultPage() {
  return <ResultScreen />;
}
