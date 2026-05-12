import * as React from "react";
import { cn } from "@/lib/utils";

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?:
    | "default"
    | "outline"
    | "secondary"
    | "ghost"
    | "destructive"
    | "chrome"
    | "sidebarIcon"
    | "oauthGoogle"
    | "oauthApple";
  size?: "default" | "sm" | "icon";
};

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => (
    <button
      ref={ref}
      className={cn(
        "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-soft)] disabled:pointer-events-none disabled:opacity-60",
        variant === "default" &&
          "h-12 px-4 bg-[var(--auth-accent)] text-[var(--auth-primary-foreground)] shadow-[var(--shadow-1)] hover:bg-[var(--auth-accent-hover)]",
        variant === "outline" &&
          "h-12 border border-[var(--auth-border)] bg-[var(--surface-muted)] px-4 text-[var(--primary)] hover:bg-[var(--primary-soft)]/50",
        variant === "secondary" &&
          "h-12 border border-[var(--auth-border)] bg-[var(--surface)] px-4 text-[var(--auth-text)] hover:bg-[var(--surface-muted)]",
        variant === "ghost" &&
          "text-[var(--auth-muted)] hover:bg-[var(--surface-muted)]/80 hover:text-[var(--auth-text)]",
        variant === "destructive" &&
          "font-bold text-[var(--live)] hover:bg-[var(--live)]/10",
        variant === "chrome" &&
          "rounded-xl p-2 text-[var(--muted)] hover:bg-[var(--surface-muted)]",
        variant === "sidebarIcon" &&
          "p-1 text-emerald-400/60 hover:bg-white/5 hover:text-white",
        variant === "oauthGoogle" &&
          "h-12 w-12 rounded-full border border-[var(--auth-border)] bg-[var(--surface)] hover:bg-[var(--surface-muted)]",
        variant === "oauthApple" &&
          "h-12 w-12 rounded-full border border-[var(--ink-deep)] bg-[var(--ink-deep)] text-white hover:bg-[var(--ink-mid)]",
        size === "sm" && "h-9 rounded-lg px-3 text-xs",
        size === "icon" && "h-9 w-9 rounded-lg p-0",
        className,
      )}
      {...props}
    />
  ),
);
Button.displayName = "Button";

export { Button };
