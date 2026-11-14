import { Shell } from "@/components/Shell";
import { ContinueBanner, FooterCta, StartButton, TryExampleButton } from "@/components/LandingActions";
import { Card, Eyebrow, H2 } from "@/components/ui";

const PAINS = [
  { t: "Reads “tap” for “tape”", d: "Same letters, wrong sound, every single night." },
  { t: "Guesses from the first letter", d: "“House” for “horse”. It works until it doesn't." },
  { t: "“Just read more,” says the teacher", d: "But read more of what? And fix what, exactly?" },
  { t: "Tutors cost $30–80 an hour", d: "And they're with your child an hour a week, not every evening." },
];

const STEPS = [
  { n: "1", t: "Your child reads a short text aloud", d: "From your phone, a laptop, or a printout. About 3 minutes." },
  { n: "2", t: "You tap the words they miss", d: "Then pick what they said instead: “bik” for “bike”. No microphone." },
  { n: "3", t: "Get the weak spot and tomorrow's plan", d: "The skill to work on, three things to say, and a 10-minute plan." },
];

const GETS = [
  { t: "Tomorrow's plan, built from tonight", d: "Word pairs, a word list and a story, all aimed at the one skill that needs it." },
  { t: "“Say this” scripts", d: "Three short things to say, word for word. No teaching degree needed." },
  { t: "A practice story where every word is checked", d: "Only words your child can decode with the skills they have, plus the one they're learning." },
  { t: "A skills map that shows progress", d: "11 reading skills, from short vowels to bossy r. Watch them move to “Mastered”." },
];

const FAQ = [
  { q: "Is my child supposed to use the app?", a: "No. You do. Your child just reads a short text aloud, from the screen or a printout. No games, no avatars, no screen time for them." },
  { q: "Is this a dyslexia test?", a: "No. Readly is a coaching tool that shows which reading skill to practice next. If you're worried about your child's reading, talk to their teacher." },
  { q: "How long does it take?", a: "About 10 minutes a night: 2 minutes of word pairs, 3 minutes of a word list, 5 minutes of a story." },
  { q: "What ages is it for?", a: "Children 5–8, from kindergarten to 2nd grade, who are learning to sound out words." },
  { q: "Do I need a microphone or an iPad?", a: "No. Any phone or laptop browser works. You listen; you tap. Nothing is recorded." },
  { q: "How do I cancel?", a: "One click in your journal settings, anytime. No phone calls, no forms." },
];

export default function Home() {
  return (
    <Shell nav={false}>
      <ContinueBanner />

      <section className="pt-4 pb-12 sm:pt-10">
        <Eyebrow>A reading coach for parents</Eyebrow>
        <h1 className="mt-3 font-display text-[2.35rem] leading-[1.1] font-semibold tracking-tight text-ink sm:text-6xl">
          Your child guesses words. Find out exactly why — in 10 minutes a night.
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft sm:text-xl">
          A reading coach for parents of K–2 kids. Your child reads from paper or the screen. You tap the words they
          miss. We tell you what to fix and what to say tomorrow.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <TryExampleButton />
          <StartButton />
        </div>
        <p className="mt-5 text-sm font-semibold tracking-wide text-ink-soft">
          No microphone · No iPad · No sign-up
        </p>
      </section>

      <section className="py-10">
        <H2>Sound familiar?</H2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {PAINS.map((p) => (
            <li key={p.t} className="rounded-2xl border border-line bg-surface p-5">
              <p className="font-semibold">{p.t}</p>
              <p className="mt-1 text-ink-soft">{p.d}</p>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-10">
        <H2>How it works</H2>
        <ol className="mt-5 grid gap-4 sm:grid-cols-3">
          {STEPS.map((s) => (
            <li key={s.n} className="rounded-2xl bg-brand-soft p-5">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand font-display text-lg font-semibold text-white">
                {s.n}
              </span>
              <p className="mt-3 font-semibold">{s.t}</p>
              <p className="mt-1 text-ink-soft">{s.d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="py-10">
        <H2>What you&apos;ll see after one check</H2>
        <Card className="mt-5">
          <p className="text-sm font-semibold text-ink-soft">Example · Mia, 6 · 1st grade</p>
          <p className="mt-2 font-display text-2xl font-semibold">Mia&apos;s weak spot: Magic e — 3 of 4 misses</p>
          <p className="mt-3 leading-relaxed text-ink-soft">
            When a word ends in a quiet e, the vowel says its name: tape, bike, home. Mia reads the short sound
            instead: bike → “bik”, home → “hom”.
          </p>
          <div className="mt-5 rounded-2xl bg-paper p-4">
            <p className="text-sm font-semibold text-accent uppercase">Say this tomorrow</p>
            <p className="mt-1 font-semibold">“See the e at the end? It&apos;s quiet, but it makes the vowel say its name.”</p>
          </div>
          <ul className="mt-5 grid gap-2 text-sm sm:grid-cols-3">
            <li className="rounded-xl border border-line px-3 py-2"><strong>2 min</strong> · word pairs: tap / tape</li>
            <li className="rounded-xl border border-line px-3 py-2"><strong>3 min</strong> · word list: cake, ride, home</li>
            <li className="rounded-xl border border-line px-3 py-2"><strong>5 min</strong> · story: “Jake&apos;s Kite”</li>
          </ul>
        </Card>
      </section>

      <section className="py-10">
        <H2>What you get every night</H2>
        <ul className="mt-5 grid gap-3 sm:grid-cols-2">
          {GETS.map((g) => (
            <li key={g.t} className="flex gap-3 rounded-2xl border border-line bg-surface p-5">
              <span aria-hidden className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-soft text-brand-strong">✓</span>
              <div>
                <p className="font-semibold">{g.t}</p>
                <p className="mt-1 text-ink-soft">{g.d}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="py-10">
        <div className="rounded-3xl bg-ink p-7 text-white sm:p-10">
          <p className="text-sm font-semibold tracking-wide text-sun uppercase">The method</p>
          <p className="mt-3 font-display text-2xl leading-snug sm:text-3xl">
            Reading specialists call it a running record. We made it a 10-minute habit any parent can do.
          </p>
          <p className="mt-4 text-white/75">
            About 40% of US 4th graders read below the basic level (NAEP 2024). Most of them got stuck on a specific,
            fixable skill years earlier.
          </p>
        </div>
      </section>

      <section className="py-10">
        <H2>Pricing</H2>
        <p className="mt-3 text-lg text-ink-soft">
          The first check, the weak spot and tomorrow&apos;s plan are free. The full 28-day plan is from{" "}
          <strong className="text-ink">$9.92/month</strong> on the yearly plan. Cancel anytime in one click.
        </p>
      </section>

      <section className="py-10">
        <H2>Questions parents ask</H2>
        <div className="mt-5 divide-y divide-line rounded-3xl border border-line bg-surface">
          {FAQ.map((f) => (
            <details key={f.q} className="group px-5 py-1">
              <summary className="flex min-h-14 cursor-pointer list-none items-center justify-between gap-4 font-semibold">
                {f.q}
                <span aria-hidden className="text-xl text-brand transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="pb-4 leading-relaxed text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="py-12 text-center">
        <p className="font-display text-3xl font-semibold">Tonight, find out what to fix.</p>
        <p className="mt-2 mb-6 text-ink-soft">10 minutes. A short text. Your phone.</p>
        <FooterCta />
      </section>
    </Shell>
  );
}
