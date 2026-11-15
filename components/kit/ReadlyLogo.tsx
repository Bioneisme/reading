import { useId } from "react";

type MarkProps = { size?: number; onDark?: boolean };

const BODY = "#4A3FD9";
const EDGE = "#2E25A3";
const INK = "#1C1A3B";

export function ReadlyMark({ size = 36, onDark = false }: MarkProps) {
  const id = useId().replace(/:/g, "");
  const bulb = `${id}b`;
  const tip = `${id}t`;
  const halo = `${id}h`;
  const clip = `${id}c`;
  return (
    <svg width={Math.round(size * 0.74)} height={size} viewBox="94 30 324 440" aria-hidden="true" className="glim-mark">
      <defs>
        <radialGradient id={bulb} cx="0.42" cy="0.32" r="0.75">
          <stop offset="0" stopColor="#FFF6CC" />
          <stop offset="0.4" stopColor="#FFE07A" />
          <stop offset="0.8" stopColor="#FFC93C" />
          <stop offset="1" stopColor="#F5B820" />
        </radialGradient>
        <radialGradient id={tip} cx="0.4" cy="0.35" r="0.7">
          <stop offset="0" stopColor="#FFF6CC" />
          <stop offset="0.6" stopColor="#FFD552" />
          <stop offset="1" stopColor="#F5B820" />
        </radialGradient>
        <radialGradient id={halo} cx="0.5" cy="0.5" r="0.5">
          <stop offset="0" stopColor="#FFE07A" stopOpacity={onDark ? 0.7 : 0.5} />
          <stop offset="0.55" stopColor="#FFE07A" stopOpacity={onDark ? 0.25 : 0.14} />
          <stop offset="1" stopColor="#FFE07A" stopOpacity="0" />
        </radialGradient>
        <clipPath id={clip}>
          <rect x="120" y="118" width="272" height="270" rx="128" />
        </clipPath>
      </defs>
      <ellipse className="glim-glow" cx="256" cy="398" rx="150" ry="70" fill={`url(#${halo})`} />
      <ellipse cx="256" cy="398" rx="100" ry="76" fill={`url(#${bulb})`} />
      <path d="M176 408 Q256 440 336 408" fill="none" stroke="#F2B92A" strokeWidth="9" strokeLinecap="round" />
      <path d="M200 444 Q256 462 312 444" fill="none" stroke="#F2B92A" strokeWidth="9" strokeLinecap="round" />
      {[
        ["M222 140 C 214 108, 200 84, 184 66", 180, 62],
        ["M290 140 C 298 108, 312 84, 328 66", 332, 62],
      ].map(([d, x, y]) => (
        <g key={String(x)}>
          <path d={String(d)} fill="none" stroke={onDark ? "#6A60EC" : BODY} strokeWidth="18" strokeLinecap="round" />
          <circle cx={Number(x)} cy={Number(y)} r="25" fill={`url(#${tip})`} />
        </g>
      ))}
      <rect x="120" y="134" width="272" height="270" rx="128" fill={onDark ? "#1B1660" : EDGE} />
      <rect x="120" y="118" width="272" height="270" rx="128" fill={onDark ? "#5248E6" : BODY} />
      <g clipPath={`url(#${clip})`}>
        <ellipse cx="392" cy="300" rx="70" ry="160" fill={onDark ? "#463CD6" : "#4036C6"} />
        <ellipse cx="190" cy="160" rx="66" ry="30" transform="rotate(-18 190 160)" fill="#6A60EC" opacity="0.8" />
      </g>
      {[206, 306].map((cx) => (
        <g key={cx} className="glim-eye">
          <ellipse cx={cx} cy="238" rx="46" ry="52" fill="#FFFFFF" />
          <circle cx={cx + 8} cy="250" r="27" fill={INK} />
          <circle cx={cx + 18} cy="238" r="10" fill="#FFFFFF" />
        </g>
      ))}
      <path d="M232 306 Q256 338 280 306 Z" fill={INK} />
    </svg>
  );
}

type LogoProps = MarkProps & { wordmark?: boolean; className?: string };

export function ReadlyLogo({ size = 36, onDark = false, wordmark = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: Math.round(size * 0.22) }}>
      <ReadlyMark size={Math.round(size * 1.25)} onDark={onDark} />
      {wordmark && (
        <span
          style={{
            fontWeight: 900,
            fontSize: Math.round(size * 0.61),
            letterSpacing: "-0.02em",
            lineHeight: 1,
            color: onDark ? "#FFFFFF" : "#1C1A3B",
          }}
        >
          Readly
        </span>
      )}
    </span>
  );
}
