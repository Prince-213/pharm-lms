import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { Inbox } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: LucideIcon;
  actionHref?: string;
  actionLabel?: string;
  className?: string;
  children?: React.ReactNode;
};

export function EmptyState({
  title,
  description,
  icon: Icon = Inbox,
  actionHref,
  actionLabel,
  className,
  children,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-14 text-center shadow-[var(--shadow-sm)]",
        className,
      )}
    >
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--surface-muted)] text-muted-foreground">
        <Icon className="h-6 w-6" strokeWidth={1.5} aria-hidden />
      </div>
      <h2 className="mt-4 font-display text-lg font-semibold text-[var(--foreground)]">
        {title}
      </h2>
      {description ? (
        <p className="mt-2 max-w-sm text-sm text-muted-foreground">{description}</p>
      ) : null}
      {actionHref && actionLabel ? (
        <Button asChild className="mt-6" size="sm">
          <Link href={actionHref}>{actionLabel}</Link>
        </Button>
      ) : null}
      {children}
    </div>
  );
}
