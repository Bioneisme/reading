import { H2, SECTION } from "./styles";

const FAQ = [
  {
    q: "Is my child supposed to use the app?",
    a: "No — you do. Your child just reads, from the screen or a printout. They never tap, swipe or log in.",
  },
  {
    q: "Is this a dyslexia test?",
    a: "No. Readly is a coaching tool, not a medical or dyslexia diagnosis. If you're worried, talk to your child's teacher or a reading specialist.",
  },
  { q: "How long does it take?", a: "About 10 minutes a night. The very first reading check takes about 3." },
  { q: "What ages is it for?", a: "Kids 5–8, from kindergarten to 2nd grade, who are learning to read." },
  {
    q: "Do I need a microphone or an iPad?",
    a: "No. Any phone or laptop browser works, and nothing listens to your child.",
  },
  { q: "How do I cancel?", a: "One click in Settings, anytime." },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className={`${SECTION} scroll-mt-4 py-24`}>
      <h2 id="faq-title" className={H2}>
        Questions parents ask
      </h2>
      <div className="mt-8 grid items-start gap-4 lg:grid-cols-2">
        {FAQ.map((f) => (
          <details key={f.q} open className="group rounded-[22px] border-2 border-line bg-card">
            <summary className="flex cursor-pointer list-none items-start justify-between gap-4 rounded-[20px] px-6 pt-[22px] pb-1 text-lg font-black group-[:not([open])]:pb-[22px] [&::-webkit-details-marker]:hidden">
              <h3>{f.q}</h3>
              <span
                aria-hidden="true"
                className="mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-paper text-ink-3 transition-transform group-open:rotate-180"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </span>
            </summary>
            <p className="px-6 pt-1 pb-[22px] text-base leading-[1.55] font-semibold text-ink-2">{f.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
