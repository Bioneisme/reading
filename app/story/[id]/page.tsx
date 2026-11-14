"use client";

import { useParams } from "next/navigation";
import { useState } from "react";
import { getStory, SKILL_ORDER, SKILLS } from "@/lib/engine";
import { Shell } from "@/components/Shell";
import { AnnotatedStory, SKILL_TAG } from "@/components/AnnotatedStory";
import { Button, Card, Eyebrow, H1, LinkButton } from "@/components/ui";

export default function StoryPage() {
  const params = useParams<{ id: string }>();
  const id = decodeURIComponent(String(params?.id ?? ""));
  const story = getStory(id);
  const [annotate, setAnnotate] = useState(false);

  if (!story) {
    return (
      <Shell>
        <H1>We couldn&apos;t find that story</H1>
        <p className="mt-3 text-ink-soft">It may have been replaced by a newer one.</p>
        <LinkButton href="/journal" className="mt-6">Back to the journal</LinkButton>
      </Shell>
    );
  }

  return (
    <Shell width="max-w-3xl">
      <div className="print:hidden">
        <Eyebrow>Practice story · {SKILLS[story.focus].name}</Eyebrow>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <label className="inline-flex min-h-12 cursor-pointer items-center gap-3 rounded-full border border-line bg-surface px-4 py-2 font-semibold">
            <input
              type="checkbox"
              role="switch"
              aria-checked={annotate}
              checked={annotate}
              onChange={(e) => setAnnotate(e.target.checked)}
              className="h-5 w-5 accent-[#2f6b5e]"
            />
            Show what each word practices
          </label>
          <Button variant="secondary" onClick={() => window.print()}>
            Print
          </Button>
        </div>
        {annotate && (
          <p className="mt-3 text-sm text-ink-soft">
            For you, not your child: each word shows the skill it practices. ★ marks words for tonight&apos;s focus
            ({SKILLS[story.focus].name}). Labels:{" "}
            {SKILL_ORDER.map((s) => SKILL_TAG[s]).join(", ")}.
          </p>
        )}
      </div>

      <Card className="print-area mt-6">
        <h1 className="mb-6 font-display text-3xl font-semibold sm:text-4xl">{story.title}</h1>
        <AnnotatedStory text={story.text} annotate={annotate} focus={story.focus} />
      </Card>
    </Shell>
  );
}
