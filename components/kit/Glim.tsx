import Image from "next/image";

export type GlimPose = "hello" | "reading" | "cheer" | "sleepy";

export function Glim({
  pose,
  size = 140,
  float = true,
  priority = false,
  className = "",
}: {
  pose: GlimPose;
  size?: number;
  float?: boolean;
  priority?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={`/mascot/glim-${pose}.svg`}
      alt=""
      aria-hidden="true"
      width={size}
      height={size}
      unoptimized
      priority={priority}
      draggable={false}
      className={`pointer-events-none select-none ${float ? "animate-float" : ""} ${className}`}
    />
  );
}
