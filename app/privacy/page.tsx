import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { H1 } from "@/components/ui";

export const metadata: Metadata = { title: "Privacy — SoundOut" };

const ITEMS = [
  ["No account, no sign-up", "SoundOut works without a login. We don't ask for your email, your name or your child's last name."],
  ["Your child's data stays on your device", "The first name, grade, quiz answers and reading history are stored in your browser (local storage). We don't keep them on our servers."],
  ["No microphone, no recordings", "SoundOut never listens to your child. You tap the words; nothing is recorded."],
  ["Payments", "Payments are handled by Stripe on Stripe's secure page. We never see your card number. We only check whether a payment went through."],
  ["Practice stories", "When we write a new practice story, we send the skill to practice and your child's first name to our story service. Nothing else."],
  ["Deleting your data", "Go to Journal → Settings → Reset all data. It's gone from this device immediately."],
];

export default function Privacy() {
  return (
    <Shell>
      <H1>Privacy, in plain language</H1>
      <dl className="mt-6 grid gap-5">
        {ITEMS.map(([t, d]) => (
          <div key={t}>
            <dt className="font-semibold">{t}</dt>
            <dd className="mt-1 leading-relaxed text-ink-soft">{d}</dd>
          </div>
        ))}
      </dl>
    </Shell>
  );
}
