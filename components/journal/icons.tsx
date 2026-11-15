import type { SkillStatus } from "@/lib/engine";

const STATUS_PATH: Record<SkillStatus, string> = {
  mastered: "M3 12a9 9 0 1 0 18 0a9 9 0 1 0-18 0M8 12.5l2.8 2.8L16 10",
  improving: "M4 17l6-6 4 4 6-7M14 8h6v6",
  needsWork: "M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0M9 12a3 3 0 1 0 6 0a3 3 0 1 0-6 0",
  notChecked: "M4 12a8 8 0 1 0 16 0a8 8 0 1 0-16 0",
};

export function StatusIcon({ status, size = 16 }: { status: SkillStatus; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={status === "notChecked" ? "3 3" : undefined}
      aria-hidden="true"
    >
      <path d={STATUS_PATH[status]} />
    </svg>
  );
}

export function Moon({ fill, stroke, size = 26 }: { fill: string; stroke: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z"
        fill={fill}
        stroke={stroke}
        strokeWidth={1.8}
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function KiteArt() {
  return (
    <svg
      viewBox="0 0 300 220"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className="absolute inset-0"
    >
      <circle cx="250" cy="44" r="60" fill="#FFC93C" opacity="0.12" />
      <circle cx="40" cy="40" r="2.5" fill="#FFE07A" />
      <circle cx="96" cy="22" r="2" fill="#FFE07A" />
      <circle cx="200" cy="120" r="2" fill="#FFE07A" />
      <g className="animate-float">
        <path d="M168 30l40 34-40 44-40-44z" fill="#FFC93C" />
        <path d="M168 30v78M128 64h80" stroke="#D99A0B" strokeWidth="3" />
        <path d="M168 108c-6 18 8 26 0 42s6 24-2 40" fill="none" stroke="#FFE07A" strokeWidth="3" strokeLinecap="round" />
        <path d="M160 132l-10 4M170 158l10 2M162 182l-10 4" stroke="#FF8A5B" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}
