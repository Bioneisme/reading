import Link from "next/link";
import { ButtonLink, Icon } from "@/components/kit";
import { KiteArt } from "./icons";

export interface TonightStory {
  when: string;
  title: string;
  sub: string;
  sample: { id: string; title: string } | null;
}

export interface TonightCopy {
  label: string;
  title: string;
  sub: string;
  cta: { label: string; href: string; secondary?: boolean };
  steps: boolean;
  story: TonightStory | null;
}

export const SECTION = "rounded-[28px] border-2 border-line bg-card shadow-edge";

const STEPS = ["2 min · Word pairs", "3 min · Word list", "5 min · Story"];

function StoryTile({ story }: { story: TonightStory }) {
  return (
    <div className="relative min-h-[220px] overflow-hidden rounded-card bg-night text-white shadow-[0_5px_0_#14124A]">
      <KiteArt />
      <p className="absolute inset-x-5 bottom-[18px]">
        <span className="block text-xs font-black uppercase tracking-[0.1em] text-[#FFD95E]">{story.when}</span>
        <span className="mt-1 block font-read text-[clamp(24px,2.4vw,30px)] font-bold leading-tight">{story.title}</span>
        <span className="mt-0.5 block text-sm font-bold text-indigo-soft">{story.sub}</span>
      </p>
    </div>
  );
}

export function TonightCard({ copy }: { copy: TonightCopy }) {
  return (
    <section
      aria-labelledby="tonight-title"
      className={`${SECTION} grid animate-rise grid-cols-[repeat(auto-fit,minmax(min(260px,100%),1fr))] items-center gap-[22px] p-[22px] sm:p-[26px]`}
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
          <ul aria-label="Session steps" className="mt-3.5 flex flex-wrap gap-2">
            {STEPS.map((s, i) => (
              <li
                key={s}
                style={{ animationDelay: `${160 + i * 70}ms` }}
                className="animate-fade rounded-full border-2 border-line bg-paper px-3 py-1.5 text-sm font-extrabold"
              >
                {s}
              </li>
            ))}
          </ul>
        )}
        <div className="mt-5 flex flex-wrap items-center gap-x-[18px] gap-y-3">
          <ButtonLink
            href={copy.cta.href}
            variant={copy.cta.secondary ? "secondary" : "primary"}
            className="whitespace-nowrap max-[400px]:gap-2 max-[400px]:px-4 max-[400px]:text-[15px]"
          >
            {!copy.cta.secondary && <Icon name="play" size={18} />}
            {copy.cta.label}
          </ButtonLink>
          {copy.story?.sample && (
            <Link
              href={`/story/${copy.story.sample.id}`}
              aria-label={`Read a sample story, ${copy.story.sample.title}`}
              className="text-link inline-flex min-h-11 cursor-pointer items-center gap-1.5 font-extrabold text-indigo text-[15px]"
            >
              Read a sample story
              <Icon name="next" size={16} strokeWidth={2.6} />
            </Link>
          )}
        </div>
      </div>
      {copy.story && <StoryTile story={copy.story} />}
    </section>
  );
}
