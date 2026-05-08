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
  headerAction 
}: AdminPanelProps) {
  return (
    <section
      className={cn(
        "rounded-[10px] bg-[var(--surface)] p-6 shadow-[var(--shadow-1)] dark:bg-gray-dark dark:shadow-card md:p-8",
        className
      )}
    >
      {title ? (
        <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-xl font-bold text-[var(--foreground)] sm:text-2xl">{title}</h3>
            {description ? (
              <p className="mt-1 text-sm font-medium text-[var(--muted-soft)]">{description}</p>
            ) : null}
          </div>
          {headerAction && <div className="shrink-0">{headerAction}</div>}
        </div>
      ) : null}
      <div>{children}</div>
    </section>
  );
}
