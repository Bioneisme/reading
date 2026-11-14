import type { Metadata } from "next";
import { LegalPage, LegalSection, Mail } from "@/components/landing/LegalPage";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Readly's privacy policy, in plain words: your child's first name and grade stay in your browser.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      current="/privacy"
      title="Privacy, in plain words"
      tone="mastered"
      summary="We collect your child's first name and grade. That's it — no photos, no voice, no email, no account."
    >
      <LegalSection title="What we collect">
        <p>
          Your child&apos;s first name and grade, your quiz answers, the words you mark during reading, and what you
          picked for what your child said. Nothing else.
        </p>
      </LegalSection>
      <LegalSection title="Where it's kept">
        <p>
          In this browser, on this device. We don&apos;t keep your child&apos;s profile on our servers. If you clear your
          browser data, it&apos;s gone.
        </p>
      </LegalSection>
      <LegalSection title="What leaves your browser">
        <p>
          To write a practice story, we send the skills being practiced to our story service. We don&apos;t save the
          request, and your child&apos;s name is never passed to the AI that writes the story. Payments go through
          Stripe; we never see your full card number.
        </p>
      </LegalSection>
      <LegalSection title="No trackers">
        <p>No ads, no ad trackers, no microphone. Nothing listens to your child, and nothing is recorded.</p>
      </LegalSection>
      <LegalSection title="Deleting everything">
        <p>Open Settings in the journal and tap Reset all data. It&apos;s removed from this browser right away.</p>
      </LegalSection>
      <LegalSection title="Questions">
        <p>
          Write to us at <Mail />. A person reads every message.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
