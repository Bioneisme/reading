import { Reveal } from "@/components/kit";
import { FaqItem } from "./FaqItem";
import { H2, SECTION } from "./styles";

const FAQ = [
  {
    q: "Is my child supposed to use the app?",
    a: "No, you do. Your child just reads, from the screen or a printout. They never tap, swipe or log in.",
  },
  {
    q: "Is this a dyslexia test?",
    a: "No. Readly is a coaching tool, not a medical or dyslexia diagnosis. If you're worried, talk to your child's teacher or a reading specialist.",
  },
  { q: "How long does it take?", a: "About 10 minutes a night. The very first reading check takes about 3." },
  { q: "What ages is it for?", a: "Kids 5-8, from kindergarten to 2nd grade, who are learning to read." },
  {
    q: "Do I need a microphone or an iPad?",
    a: "No. Any phone or laptop browser works, and nothing listens to your child.",
  },
  { q: "How do I cancel?", a: "One click in Settings, anytime." },
];

export function Faq() {
  return (
    <section id="faq" aria-labelledby="faq-title" className={`${SECTION} scroll-mt-4 py-24`}>
      <Reveal>
        <h2 id="faq-title" className={H2}>
          Questions parents ask
        </h2>
      </Reveal>
      <div className="mt-8 grid items-start gap-4 lg:grid-cols-2">
        {FAQ.map((f, i) => (
          <Reveal key={f.q} delay={(i % 2) * 100}>
            <FaqItem q={f.q} a={f.a} />
          </Reveal>
        ))}
      </div>
    </section>
  );
}
