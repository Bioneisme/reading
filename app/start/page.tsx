import type { Metadata } from "next";
import { StartClient } from "@/components/quiz/StartClient";

export const metadata: Metadata = {
  title: "A few quick questions",
  description: "Six quick questions about your child's reading. First name and grade are all we ask.",
};

export default function StartPage() {
  return <StartClient />;
}
