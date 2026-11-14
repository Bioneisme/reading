"use client";

import Link from "next/link";
import { SKILLS, passageForGrade, quizProfile, wordsOf } from "@/lib/engine";
import { useStore } from "@/lib/client/store";
import { buttonClass, Icon } from "@/components/kit";
import { LearningPanel, type Fact } from "./LearningPanel";
import { QuizShell } from "./QuizShell";
import { SPOT, gradeLabel, pickedSkills, possessive } from "./copy";

function NoQuiz() {
  return (
    <QuizShell stepLabel="Profile" done={0} hint="It takes about a minute.">
      <h1 className="m-0 text-[28px] font-black leading-[1.12] tracking-[-0.02em] lg:text-[40px]">
        Let&apos;s start with a few questions
      </h1>
      <p className="mt-2 text-[17px] font-semibold text-ink-2">
        Six quick questions, then we build your child&apos;s reading profile.
      </p>
      <Link href="/start" className={buttonClass("primary", "lg", false, "mt-6")}>
        Start the quiz
        <Icon name="next" size={18} strokeWidth={2.4} />
      </Link>
    </QuizShell>
  );
}

export function ProfileClient() {
  const snap = useStore();
  if (!snap) return <div className="min-h-dvh bg-paper" />;
  const { child, quiz } = snap.real;
  if (!child) return <NoQuiz />;

  const name = child.name;
  const poss = possessive(name);
  const signs = quiz?.signs ?? [];
  const picked = pickedSkills(signs);
  const skills = quizProfile(signs);
  const grade = gradeLabel(child.grade);
  const words = wordsOf(passageForGrade(child.grade).text).length;
  const heardShort = picked.length
    ? picked.map((k) => (SPOT[k]?.name ?? k).split(":")[0]).join(", ")
    : signs.includes("unsure")
      ? "Not sure yet"
      : null;

  const facts: Fact[] = [
    { k: "Name", v: name },
    { k: "Grade", v: grade },
    { k: "You’ve heard", v: heardShort },
    { k: "Evenings", v: quiz?.evenings ?? null },
    { k: "Time", v: quiz ? `${quiz.minutes} min a night` : null },
    { k: "Goal", v: quiz?.goal ?? null },
  ];

  return (
    <QuizShell
      stepLabel="Profile"
      done={6}
      backHref="/start?step=6"
      aside={<LearningPanel name={name} facts={facts} spots={picked} />}
      hint="You can change any answer — tap the back arrow."
    >
      <div className="flex flex-wrap items-center gap-2.5">
        <h1 className="m-0 text-[30px] font-black leading-[1.1] tracking-[-0.02em] lg:text-[clamp(30px,3.2vw,42px)]">
          {poss.charAt(0).toUpperCase() + poss.slice(1)} reading profile
        </h1>
        <span className="rounded-full border-2 border-edge bg-card px-2.5 py-1 text-xs font-black uppercase tracking-[0.06em] text-ink-2">
          Preliminary
        </span>
      </div>
      <p className="mt-2 text-[17px] font-semibold leading-normal text-ink-2">
        {picked.length
          ? "Based on what you've heard. Tonight's check will confirm it."
          : `You weren't sure yet, so these are the most common spots in ${grade}. Tonight's check will show where ${name} really is.`}
      </p>

      <ol className="mt-[18px] flex flex-col gap-3">
        {skills.map((s, i) => {
          const copy = SPOT[s];
          const fromQuiz = picked.includes(s);
          return (
            <li key={s} className="flex items-start gap-3.5 rounded-[22px] border-2 border-line bg-card p-[18px] shadow-edge">
              <span
                aria-hidden="true"
                className="inline-flex h-12 w-11 flex-none items-center justify-center rounded-[13px] border-2 border-[#E8AE1C] bg-lamp font-read text-2xl font-bold shadow-edge-lamp"
              >
                {i + 1}
              </span>
              <span className="min-w-0">
                <span className="block text-xs font-black uppercase tracking-[0.1em] text-ink-3">Likely weak spot</span>
                <span className="mt-0.5 block text-xl font-black">{copy?.name ?? SKILLS[s].name}</span>
                <span className="mt-1 block text-base font-semibold leading-normal text-ink-2">
                  {copy ? copy.explain(name) : SKILLS[s].explain(name, [])}
                </span>
                <span className="mt-2 inline-block rounded-full bg-indigo-tint px-2.5 py-[3px] text-[13px] font-extrabold text-[#2B2290]">
                  {fromQuiz && copy?.heard ? `You've heard: ${copy.heard}` : `Common in ${grade}`}
                </span>
              </span>
            </li>
          );
        })}
      </ol>

      <section aria-labelledby="tonight-check" className="on-dark mt-[18px] rounded-card bg-night p-[22px] text-white shadow-edge-night">
        <div className="text-xs font-black uppercase tracking-[0.1em] text-[#FFD95E]">Tonight</div>
        <h2 id="tonight-check" className="mt-1.5 text-2xl font-black leading-[1.25]">
          A 3-minute reading check to confirm.
        </h2>
        <p className="mt-1.5 text-base font-semibold leading-normal text-indigo-soft">
          {grade} text · {words} words · read from the screen or print it.
        </p>
        <Link href="/check" className={buttonClass("lamp", "lg", true, "mt-4 font-black")}>
          Start tonight&apos;s check
          <Icon name="next" size={18} strokeWidth={2.4} />
        </Link>
      </section>
    </QuizShell>
  );
}
