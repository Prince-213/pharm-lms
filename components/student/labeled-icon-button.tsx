"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Tone = "default" | "primary" | "success";

const toneClasses: Record<Tone, string> = {
  default:
    "border-slate-200/90 bg-white text-slate-600 hover:bg-slate-50 active:bg-slate-100",
  primary:
    "border-[var(--primary)]/25 bg-[var(--primary-soft)]/40 text-[var(--primary-strong)] hover:bg-[var(--primary-soft)]/60",
  success:
    "border-primary/40 bg-primary/10 text-primary",
};

type LabeledIconButtonProps = {
  icon: LucideIcon;
  label: string;
  /** Screen reader label; defaults to visible label. */
  ariaLabel?: string;
  layout?: "compact" | "stacked";
  tone?: Tone;
  disabled?: boolean;
  className?: string;
  href?: string;
  onClick?: () => void;
  type?: "button" | "submit";
};

export function LabeledIconButton({
  icon: Icon,
  label,
  ariaLabel,
  layout = "compact",
  tone = "default",
  disabled = false,
  className,
  href,
  onClick,
  type = "button",
}: LabeledIconButtonProps) {
  const a11yLabel = ariaLabel ?? label;
  const isStacked = layout === "stacked";

  const inner = (
    <>
      <Icon
        className={cn(
          "shrink-0",
          isStacked ? "h-5 w-5" : "h-4 w-4",
        )}
        aria-hidden
      />
      <span
        className={cn(
          "font-semibold leading-none",
          isStacked
            ? "text-[10px] tracking-wide"
            : "text-[10px] uppercase tracking-wide",
        )}
      >
        {label}
      </span>
    </>
  );

  const shared = cn(
    "inline-flex items-center justify-center transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1",
    "active:scale-[0.97]",
    isStacked
      ? "min-w-[3.25rem] flex-col gap-0.5 rounded-xl px-2 py-1.5"
      : "gap-1.5 rounded-lg border px-2.5 py-2 min-h-10",
    !isStacked && toneClasses[tone],
    isStacked && "border-0 bg-transparent text-slate-500",
    disabled && "pointer-events-none opacity-40",
    className,
  );

  if (href && !disabled) {
    return (
      <Link href={href} className={shared} aria-label={a11yLabel}>
        {inner}
      </Link>
    );
  }

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={shared}
      aria-label={a11yLabel}
    >
      {inner}
    </button>
  );
}
