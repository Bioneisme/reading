import type { Metadata } from "next";
import { Shell } from "@/components/Shell";
import { H1 } from "@/components/ui";

export const metadata: Metadata = { title: "Terms — SoundOut" };

const ITEMS = [
  ["What SoundOut is", "A coaching tool that helps parents practice reading with their child for about 10 minutes a night. It's not a medical, psychological or dyslexia test, and it doesn't replace your child's teacher. If you're worried, talk to the teacher."],
  ["Who it's for", "Parents and caregivers of children aged 5–8. The parent uses the app; the child only reads."],
  ["Plans and billing", "1 week for $6.93, then $19.99 every 4 weeks. 4 weeks for $14.99, then $19.99 every 4 weeks. 1 year for $119. Plans renew automatically until you cancel."],
  ["Cancelling", "Cancel anytime in one click from Journal → Settings. You keep access until the end of the period you paid for."],
  ["Your data", "Your data lives on your device. See the privacy page for details."],
  ["Fair use", "Please don't resell or copy the stories and plans in bulk. They're for your family."],
];

export default function Terms() {
  return (
    <Shell>
      <H1>Terms, in plain language</H1>
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
