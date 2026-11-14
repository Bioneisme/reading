const BASE = "tactile inline-flex items-center justify-center gap-2.5 font-extrabold select-none";

const TONE = {
  primary: "bg-indigo text-white shadow-edge-indigo",
  secondary: "border-2 border-line-strong bg-card text-ink shadow-edge-strong",
  lamp: "bg-lamp font-black text-ink shadow-edge-lamp",
  outlineDark: "border-2 border-[#6F69C9] bg-transparent text-white shadow-[0_4px_0_#3A3690]",
} as const;

export function cta(tone: keyof typeof TONE, extra = "") {
  return `${BASE} ${TONE[tone]} ${extra.includes("rounded-") ? "" : "rounded-button"} ${extra}`;
}

export const SECTION = "mx-auto max-w-[1200px] px-6";
export const H2 = "text-[clamp(30px,3.2vw,44px)] leading-[1.1] font-black tracking-[-0.02em]";
export const EYEBROW = "text-[13px] font-black uppercase tracking-[0.1em] text-indigo";
export const LEAD = "text-lg leading-[1.6] font-semibold text-ink-2";
export const BODY = "text-base leading-[1.55] font-semibold text-ink-2";
