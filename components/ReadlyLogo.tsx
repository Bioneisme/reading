type MarkProps = { size?: number; onDark?: boolean };

export function ReadlyMark({ size = 36, onDark = false }: MarkProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect x="2" y="6" width="36" height="32" rx="10" fill={onDark ? "#0F0D3D" : "#17145A"} />
      <rect x="2" y="2" width="36" height="32" rx="10" fill={onDark ? "#3A3690" : "#2E2A86"} />
      <path
        d="M13.5 28V18.5a6 6 0 0 1 6-6H23"
        fill="none"
        stroke="#FFC93C"
        strokeWidth="4.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M33 10.75A4 4 0 0 1 27.75 5.5a4 4 0 1 0 5.25 5.25z" fill="#FFE07A" />
    </svg>
  );
}

type LogoProps = MarkProps & { wordmark?: boolean; className?: string };

export function ReadlyLogo({ size = 36, onDark = false, wordmark = true, className = "" }: LogoProps) {
  return (
    <span className={`inline-flex items-center ${className}`} style={{ gap: Math.round(size * 0.28) }}>
      <ReadlyMark size={size} onDark={onDark} />
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
