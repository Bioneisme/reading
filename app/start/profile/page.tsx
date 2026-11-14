import type { Metadata } from "next";
import { ProfileClient } from "@/components/quiz/ProfileClient";

export const metadata: Metadata = {
  title: "Preliminary reading profile",
  description: "The likely weak spots in your child's reading, based on what you've heard.",
};

export default function ProfilePage() {
  return <ProfileClient />;
}
