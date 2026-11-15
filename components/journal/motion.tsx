"use client";

import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";

export function useInView<T extends Element>(): [RefObject<T | null>, boolean] {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    let raf = 0;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          raf = requestAnimationFrame(() => setSeen(true));
        }
      },
      { rootMargin: "0px 0px -8% 0px" },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [seen]);
  return [ref, seen];
}

export function Collapse({
  open,
  children,
  className = "",
}: {
  open: boolean;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      inert={!open}
      aria-hidden={!open}
      className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-(--ease-out-soft) ${
        open ? "-mb-2 grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
      }`}
    >
      <div className="-mx-2 min-h-0 overflow-hidden px-2">
        <div className={`pb-2 ${className}`}>{children}</div>
      </div>
    </div>
  );
}
