"use client";

import { cn } from "@/lib/utils";

type AdminPanelProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  headerAction?: React.ReactNode;
};

export function AdminPanel({
  title,
  description,
  children,
  className,
  headerAction,
}: AdminPanelProps) {
  return (
    <section
      className={cn(
        // Clinical-minimalist: flat border, no shadow, clean white surface
        "rounded-xl border border-slate-200/60 bg-[var(--surface)] p-6 md:p-8",
        className,
      )}
    >
      {title ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div className="min-w-0">
            <h2 className="font-display truncate text-lg font-bold tracking-tight text-[var(--foreground)]">
              {title}
            </h2>
            {description ? (
              <p className="mt-0.5 text-sm text-slate-500">{description}</p>
            ) : null}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
