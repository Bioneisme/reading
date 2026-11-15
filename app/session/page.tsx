import type { Metadata } from "next";
import { SessionScreen } from "@/components/session/SessionScreen";

export const metadata: Metadata = { title: "Tonight's session" };

export default function SessionPage() {
  return <SessionScreen />;
}
