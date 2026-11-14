import Link from "next/link";
import { ButtonLink, Icon } from "@/components/kit";
import { KiteArt } from "./icons";

export interface TonightCopy {
  label: string;
  title: string;
  sub: string;
  cta: { label: string; href: string; secondary?: boolean };
  steps: boolean;
  story: { id: string; title: string; words: number } | null;
}

export const SECTION = "rounded-[28px] border-2 border-line bg-card shadow-edge";

export function StoryTile({ story }: { story: { id: string; title: string; words: number } }) {
  return (
    <Link
      href={`/story/${story.id}`}
      aria-label={`Open tonight's story, ${story.title}`}
      className="tactile relative block min-h-[220px] overflow-hidden rounded-card bg-night text-white no-underline shadow-[0_5px_0_#14124A]"
    >
      <KiteArt />
      <span className="absolute inset-x-5 bottom-[18px]">
        <span className="block text-xs font-black uppercase tracking-[0.1em] text-[#FFD95E]">Tonight&apos;s story</span>
        <span className="mt-1 block font-read text-[30px] font-bold leading-tight">{story.title}</span>
        <span className="mt-0.5 block text-sm font-bold text-indigo-soft">{story.words} words · every word checked</span>
      </span>
    </Link>
  );
}

export function TonightCard({ copy }: { copy: TonightCopy }) {
  return (
    <section
      aria-labelledby="tonight-title"
      className={`${SECTION} grid grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] items-center gap-[22px] p-[22px] sm:p-[26px]`}
    >
      <div>
        <div className="text-[13px] font-black uppercase tracking-[0.1em] text-indigo">{copy.label}</div>
        <h2
          id="tonight-title"
          className="mt-1.5 text-[clamp(26px,2.6vw,34px)] font-black leading-[1.1] tracking-[-0.02em]"
        >
          {copy.title}
        </h2>
        <p className="mt-2 text-base font-semibold leading-normal text-ink-2">{copy.sub}</p>
        {copy.steps && (
          <ul aria-label="Tonight's steps" className="mt-3.5 flex flex-wrap gap-2">
            {["2 min · Word pairs", "3 min · Word list", "5 min · Story"].map((s) => (
              <li key={s} className="rounded-full border-2 border-line bg-paper px-3 py-1.5 text-sm font-extrabold">
                {s}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-x-[18px] gap-y-3">
          <ButtonLink href={copy.cta.href} variant={copy.cta.secondary ? "secondary" : "primary"}>
            {!copy.cta.secondary && <Icon name="play" size={18} />}
            {copy.cta.label}
          </ButtonLink>
          {copy.story && (
            <Link href={`/story/${copy.story.id}`} className="text-link text-[15px] font-extrabold text-indigo underline">
              Read tonight&apos;s story
            </Link>
          )}
        </div>
      </div>
      {copy.story && <StoryTile story={copy.story} />}
    </section>
  );
}
