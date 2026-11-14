import type { ComponentProps } from "react";

type Tone = "card" | "night" | "indigo" | "lamp" | "sand";

const TONE: Record<Tone, string> = {
  card: "bg-card border-2 border-line shadow-edge",
  night: "bg-night text-white shadow-edge-night",
  indigo: "bg-indigo-tint border-2 border-indigo-soft",
  lamp: "bg-lamp-tint border-2 border-lamp-line text-lamp-ink",
  sand: "bg-sand border-2 border-line",
};

export function Card({ tone = "card", className = "", ...rest }: { tone?: Tone } & ComponentProps<"div">) {
  return <div className={`rounded-card ${TONE[tone]} ${className}`} {...rest} />;
}

export function Eyebrow({ className = "", ...rest }: ComponentProps<"p">) {
  return <p className={`text-xs font-black uppercase tracking-[0.12em] text-indigo ${className}`} {...rest} />;
}

export function Container({ className = "", wide = false, ...rest }: { wide?: boolean } & ComponentProps<"div">) {
  return <div className={`mx-auto w-full px-6 ${wide ? "max-w-[1200px]" : "max-w-[1120px]"} ${className}`} {...rest} />;
}
