import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "lamp" | "night" | "ghost";
export type ButtonSize = "lg" | "md" | "sm";

const VARIANT: Record<ButtonVariant, string> = {
  primary: "tactile bg-indigo text-white shadow-edge-indigo",
  secondary: "tactile border-2 border-line-strong bg-card text-ink shadow-edge-strong",
  lamp: "tactile bg-lamp text-ink shadow-edge-lamp",
  night: "tactile bg-night text-white shadow-edge-night",
  ghost: "bg-transparent text-indigo underline-offset-4 hover:underline",
};

const SIZE: Record<ButtonSize, string> = {
  lg: "min-h-14 px-6 text-[17px] rounded-button",
  md: "min-h-12 px-5 text-base rounded-button",
  sm: "min-h-11 px-4 text-[15px] rounded-chip",
};

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "lg", block = false, extra = "") {
  return [
    "inline-flex items-center justify-center gap-2.5 font-extrabold no-underline select-none",
    VARIANT[variant],
    SIZE[size],
    block ? "w-full" : "",
    extra,
  ]
    .filter(Boolean)
    .join(" ");
}

type Common = { variant?: ButtonVariant; size?: ButtonSize; block?: boolean; className?: string; children: ReactNode };

export function Button({
  variant,
  size,
  block,
  className,
  type = "button",
  ...rest
}: Common & Omit<ComponentProps<"button">, "className">) {
  return <button type={type} className={buttonClass(variant, size, block, className)} {...rest} />;
}

export function ButtonLink({
  variant,
  size,
  block,
  className,
  ...rest
}: Common & Omit<ComponentProps<typeof Link>, "className">) {
  return <Link className={buttonClass(variant, size, block, className)} {...rest} />;
}
