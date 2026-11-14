import type { Metadata } from "next";
import { JournalScreen } from "@/components/journal/JournalScreen";

export const metadata: Metadata = { title: "Journal" };

export default function JournalPage() {
  return <JournalScreen />;
}
