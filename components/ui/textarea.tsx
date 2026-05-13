import * as React from "react";
import { cn } from "@/lib/utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => (
    <textarea
      ref={ref}
      className={cn(
        "min-h-[120px] w-full resize-y rounded-xl border border-[var(--auth-border)] bg-[var(--auth-input-bg)] px-3 py-2.5 text-sm text-[var(--auth-text)] outline-none transition-shadow placeholder:text-[var(--auth-muted)] focus-visible:border-[var(--primary)] focus-visible:ring-2 focus-visible:ring-[var(--primary-soft)] disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Textarea.displayName = "Textarea";

export { Textarea };
