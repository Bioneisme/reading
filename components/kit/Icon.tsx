const PATHS = {
  play: "M7 4.5v15l12.5-7.5z",
  next: "M5 12h14M13 6l6 6-6 6",
  back: "M15 6l-6 6 6 6",
  check: "M5 12.5l4.5 4.5L19 7.5",
  close: "M6 6l12 12M18 6L6 18",
  lock: "M5 11h14v10H5zM8 11V8a4 4 0 0 1 8 0v3",
  print: "M7 9V4h10v5M7 18H5a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2M7 14h10v7H7z",
  moon: "M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5z",
  calendar: "M3 5h18v16H3zM3 10h18M8 3v4M16 3v4",
  shield: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6zM9 12l2 2 4-4",
  book: "M12 6c-2-1.5-5-2-8-2v14c3 0 6 .5 8 2 2-1.5 5-2 8-2V4c-3 0-6 .5-8 2zM12 6v14",
  say: "M21 12a8 8 0 0 1-11.6 7.1L4 20l1.1-4.6A8 8 0 1 1 21 12z",
  retry: "M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7",
  improving: "M4 17l6-6 4 4 6-7M14 8h6v6",
  noMic: "M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.7M19 11a7 7 0 0 1-1.2 3.9M5 11a7 7 0 0 0 11.2 5.6M12 19v3M3 3l18 18",
  noTablet: "M5 2.5h14v19H5zM11 18h2M3 3l18 18",
  noAccount: "M15 8a4 4 0 1 1-8 0 4 4 0 0 1 8 0zM3.5 20a7.5 7.5 0 0 1 11.6-6.3M3 3l18 18",
} as const;

export type IconName = keyof typeof PATHS;

type Props = {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
  title?: string;
};

export function Icon({ name, size = 24, strokeWidth = 2, className, title }: Props) {
  const filled = name === "play";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke={filled ? "none" : "currentColor"}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <path d={PATHS[name]} />
    </svg>
  );
}
