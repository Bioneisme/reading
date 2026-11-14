import type { Metadata } from "next";
import { LegalPage, LegalSection, Mail } from "@/components/landing/LegalPage";

export const metadata: Metadata = {
  title: "Terms",
  description: "Readly's terms, in plain words: plans, billing, cancelling and refunds.",
};

const PLANS = [
  "1 week: $6.93, then $19.99 every 4 weeks.",
  "4 weeks: $14.99, then $19.99 every 4 weeks.",
  "1 year: $119 a year.",
];

export default function TermsPage() {
  return (
    <LegalPage
      current="/terms"
      title="Terms, in plain words"
      tone="lamp"
      summary="Readly is a coaching tool for parents — not a medical or dyslexia diagnosis. If you're worried, talk to your child's teacher."
    >
      <LegalSection title="Plans and billing">
        <ul className="list-disc pl-[22px] leading-[1.7]">
          {PLANS.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
        <p>Plans renew automatically until you cancel.</p>
      </LegalSection>
      <LegalSection title="Cancel anytime">
        <p>
          Cancel anytime in one click from your journal settings. No more charges after that, and you keep access until
          the end of the period you paid for.
        </p>
      </LegalSection>
      <LegalSection title="Refunds">
        <p>
          For refunds within 14 days of a charge, email <Mail />.
        </p>
      </LegalSection>
      <LegalSection title="Your data">
        <p>It lives in your browser. If you clear it or switch devices, your progress doesn&apos;t come along.</p>
      </LegalSection>
      <LegalSection title="Fair use">
        <p>Readly is for your own family. Please don&apos;t resell the stories or copy the app.</p>
      </LegalSection>
      <LegalSection title="Questions">
        <p>
          Write to us at <Mail />.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
