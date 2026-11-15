"use client";

import { useEffect, useRef, useState, type MouseEvent } from "react";
import { flushSync } from "react-dom";

export function FaqItem({ q, a }: { q: string; a: string }) {
  const ref = useRef<HTMLDetailsElement>(null);
  const timer = useRef<number | undefined>(undefined);
  const [native, setNative] = useState(true);
  const [expanded, setExpanded] = useState(true);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const onSummary = (e: MouseEvent<HTMLElement>) => {
    const el = ref.current;
    if (!el) return;
    e.preventDefault();
    window.clearTimeout(timer.current);
    if (expanded) {
      setExpanded(false);
      timer.current = window.setTimeout(() => setNative(false), 300);
      return;
    }
    if (!el.open) {
      flushSync(() => setNative(true));
      el.getBoundingClientRect();
    }
    setExpanded(true);
  };

  const onToggle = () => {
    const el = ref.current;
    if (!el) return;
    setNative(el.open);
    if (el.open) setExpanded(true);
  };

  return (
    <details ref={ref} open={native} onToggle={onToggle} className="rounded-[22px] border-2 border-line bg-card pb-[18px]">
      <summary
        onClick={onSummary}
        className="group/q flex cursor-pointer list-none items-start justify-between gap-4 rounded-[20px] px-6 pt-[22px] pb-1 text-lg font-black [&::-webkit-details-marker]:hidden"
      >
        <h3>{q}</h3>
        <span
          aria-hidden="true"
          className={`mt-0.5 inline-flex size-7 shrink-0 items-center justify-center rounded-full bg-paper text-ink-3 transition-[rotate,background-color,color] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] group-hover/q:bg-indigo-tint group-hover/q:text-indigo ${
            expanded ? "rotate-180" : "rotate-0"
          }`}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9l6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div
        className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.2,0.7,0.2,1)] ${
          expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
        }`}
      >
        <div className="min-h-0 overflow-hidden">
          <p className="px-6 pt-1 pb-1 text-base leading-[1.55] font-semibold text-ink-2">{a}</p>
        </div>
      </div>
    </details>
  );
}
