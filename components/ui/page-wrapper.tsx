import * as React from "react";
import { cn } from "@/lib/utils";

type PageWrapperProps = {
  /** Page-level heading shown above content */
  heading?: React.ReactNode;
  /** Secondary heading line (e.g. role description or breadcrumb) */
  subheading?: React.ReactNode;
  /** Optional set of action buttons to display top-right of header */
  actions?: React.ReactNode;
  /** Max content width. Defaults to "xl" (1280px). */
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  className?: string;
  children: React.ReactNode;
};

const maxWidthMap: Record<NonNullable<PageWrapperProps["maxWidth"]>, string> = {
  sm: "max-w-xl",
  md: "max-w-2xl",
  lg: "max-w-4xl",
  xl: "max-w-5xl",
  "2xl": "max-w-7xl",
  full: "max-w-none",
};

/**
 * PageWrapper — clinical-minimalist page-level layout container.
 *
 * Enforces consistent max-width, vertical spacing, and typography hierarchy
 * across all portal pages (Student, Mentor, Admin, Tutor).
 *
 * Usage:
 * ```tsx
 * <PageWrapper heading="My Courses" subheading="Track your learning progress" actions={<Button>Enroll</Button>}>
 *   <CourseGrid />
 * </PageWrapper>
 * ```
 */
export function PageWrapper({
  heading,
  subheading,
  actions,
  maxWidth = "2xl",
  className,
  children,
}: PageWrapperProps) {
  return (
    <div className={cn("w-full", maxWidthMap[maxWidth], className)}>
      {(heading ?? subheading ?? actions) && (
        <div className="mb-8 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
          {(heading ?? subheading) && (
            <div className="space-y-1">
              {heading && (
                <h1 className="font-display text-2xl font-black tracking-tight text-[var(--foreground)] sm:text-3xl">
                  {heading}
                </h1>
              )}
              {subheading && (
                <p className="text-sm text-slate-500">{subheading}</p>
              )}
            </div>
          )}
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      <div className="space-y-8">{children}</div>
    </div>
  );
}

/**
 * PageSection — a semantic sub-section within a PageWrapper.
 * Provides a section title + optional description with consistent spacing.
 */
export function PageSection({
  title,
  description,
  actions,
  className,
  children,
}: {
  title?: React.ReactNode;
  description?: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title ?? description ?? actions) && (
        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-0.5">
            {title && (
              <h2 className="font-display text-base font-bold tracking-tight text-[var(--foreground)]">
                {title}
              </h2>
            )}
            {description && (
              <p className="text-xs text-slate-500">{description}</p>
            )}
          </div>
          {actions && (
            <div className="flex shrink-0 items-center gap-2">{actions}</div>
          )}
        </div>
      )}
      {children}
    </section>
  );
}
