import Image from "next/image";
import { cn } from "@/lib/utils";

export const BRAND_LOGO_SRC = "/pharm_logo.webp";

type PharmLogoProps = {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
  wordmark?: boolean;
  /** Sit the navy mark on a white plate and use a light wordmark. */
  inverted?: boolean;
  priority?: boolean;
};

export function PharmLogo({
  className,
  markClassName,
  wordmarkClassName,
  wordmark = true,
  inverted = false,
  priority = false,
}: PharmLogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span
        className={cn(
          "inline-flex shrink-0 items-center justify-center",
          inverted && "rounded-md bg-white p-0.5 shadow-sm",
        )}
      >
        <Image
          src={BRAND_LOGO_SRC}
          alt={wordmark ? "" : "PharmEdge"}
          width={40}
          height={40}
          className={cn("h-8 w-8 object-contain", markClassName)}
          priority={priority}
        />
      </span>
      {wordmark ? (
        <span
          className={cn(
            "font-display text-lg font-bold tracking-tight",
            inverted ? "text-white" : "text-[var(--ink-deep)]",
            wordmarkClassName,
          )}
        >
          PharmEdge
        </span>
      ) : null}
    </span>
  );
}
