"use client";

import type { ReactNode } from "react";
import { Info, Loader2 } from "lucide-react";
import {
  CurriculumTreeChildren,
  CurriculumTreeGroup,
  type CurriculumGroupKind,
} from "@/components/curriculum/curriculum-tree-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { cnUdemyCard, cnUdemyInput, udemyBorderClass } from "@/lib/ui/udemy-surface";
import { cn } from "@/lib/utils";

export const selectClassName = cn(
  "flex h-9 w-full rounded-md border bg-background px-2.5 py-1 text-sm shadow-xs transition-[color,box-shadow] outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50",
  cnUdemyInput(),
);

export function CurriculumEditorSkeleton() {
  return (
    <div className="space-y-4 px-4 py-6 sm:px-6">
      <Skeleton className="h-4 w-2/3 max-w-md" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <Skeleton className="h-32 w-full rounded-xl" />
    </div>
  );
}

export function CurriculumReadOnlyBanner() {
  return (
    <Alert className="border-border bg-muted/40">
      <Info className="size-4" />
      <AlertDescription>
        This course is pending review. Curriculum is read-only until approval.
      </AlertDescription>
    </Alert>
  );
}

export function CurriculumSavingIndicator() {
  return (
    <p className="flex items-center gap-2 text-xs text-muted-foreground">
      <Loader2 className="size-3.5 animate-spin text-primary" aria-hidden />
      Saving changes…
    </p>
  );
}

export function CurriculumField({
  label,
  htmlFor,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-xs font-semibold text-foreground">
        {label}
      </Label>
      {children}
      {error ? (
        <p className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  );
}

export function PanelFormActions({
  onCancel,
  onSubmit,
  submitLabel,
  submitDisabled,
  cancelDisabled,
}: {
  onCancel: () => void;
  onSubmit: () => void;
  submitLabel: string;
  submitDisabled?: boolean;
  cancelDisabled?: boolean;
}) {
  return (
    <div className="flex flex-wrap justify-end gap-2 border-t border-border pt-4">
      <Button
        type="button"
        variant="outline"
        size="lg"
        onClick={onCancel}
        disabled={cancelDisabled}
      >
        Cancel
      </Button>
      <Button
        type="button"
        size="lg"
        onClick={onSubmit}
        disabled={submitDisabled}
      >
        {submitLabel}
      </Button>
    </div>
  );
}

export function CurriculumSectionHeading({
  title,
  description,
  count,
}: {
  title: string;
  description?: string;
  count?: number;
}) {
  return (
    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
      <div className="min-w-0 space-y-1">
        <h4 className="text-sm font-semibold text-foreground">{title}</h4>
        {description ? (
          <p className="text-xs text-muted-foreground">{description}</p>
        ) : null}
      </div>
      {count !== undefined && count > 0 ? (
        <Badge variant="outline" className="shrink-0 tabular-nums">
          {count}
        </Badge>
      ) : null}
    </div>
  );
}

type CurriculumSubsectionTone = "lectures" | "resources" | "assessments";

const toneToGroupKind: Record<CurriculumSubsectionTone, CurriculumGroupKind> = {
  lectures: "content",
  resources: "resources",
  assessments: "assessments",
};

const toneToTitle: Record<CurriculumSubsectionTone, string> = {
  lectures: "Content units",
  resources: "Section resources",
  assessments: "Section assessment",
};

/** Groups content inside a section with collapsible folder tree UI. */
export function CurriculumSubsection({
  tone,
  title,
  description,
  count,
  children,
  className,
  defaultOpen = true,
}: {
  tone: CurriculumSubsectionTone;
  title?: string;
  description?: string;
  count?: number;
  children: ReactNode;
  className?: string;
  defaultOpen?: boolean;
}) {
  const displayTitle = title ?? toneToTitle[tone];
  return (
    <section
      className={cn("mb-5 overflow-hidden rounded-lg border border-border", className)}
    >
      <CurriculumTreeGroup
        kind={toneToGroupKind[tone]}
        title={displayTitle}
        count={count}
        defaultOpen={defaultOpen}
      >
        <CurriculumTreeChildren className="space-y-4 px-2 py-3.5 sm:px-3 sm:py-4.5">
          {description ? (
            <p className="px-1 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
          {children}
        </CurriculumTreeChildren>
      </CurriculumTreeGroup>
    </section>
  );
}

export function CurriculumEmptyState({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-dashed border-[#d1d7dc] bg-[#f7f9fa] px-4 py-8 text-center">
      <p className="text-sm text-muted-foreground">{message}</p>
    </div>
  );
}

export function CurriculumList({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden border border-[#d1d7dc] bg-[var(--surface)]",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CurriculumListItem({
  children,
  className,
  index,
  indexLabel,
}: {
  children: ReactNode;
  className?: string;
  /** Optional 1-based index shown beside the row (e.g. lecture number). */
  index?: number;
  /** Prefer over `index` when using section.unit labels like "1.2". */
  indexLabel?: string;
}) {
  const label =
    indexLabel ?? (index !== undefined ? String(index) : undefined);
  return (
    <div
      className={cn(
        "border-b border-[#d1d7dc] bg-white px-4 py-4.5 last:border-b-0 sm:px-5",
        "even:bg-[#fafbfc]",
        className,
      )}
    >
      {label !== undefined ? (
        <div className="mb-3 flex items-center gap-2">
          <span className="inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-[#eceff1] px-1.5 text-[11px] font-bold tabular-nums text-muted-foreground">
            {label}
          </span>
          <span className="h-px flex-1 bg-[#d1d7dc]" aria-hidden />
        </div>
      ) : null}
      {children}
    </div>
  );
}

export function CurriculumItemMeta({
  icon,
  title,
  badge,
  badgeVariant = "secondary",
  actions,
  iconBoxClassName,
}: {
  icon: ReactNode;
  title: ReactNode;
  badge?: string;
  badgeVariant?: "default" | "secondary" | "outline" | "mint";
  actions?: ReactNode;
  iconBoxClassName?: string;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex min-w-0 flex-1 items-center gap-3">
        <div
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded border border-[#d1d7dc] bg-[#f7f9fa] text-[var(--foreground)]",
            iconBoxClassName,
          )}
        >
          {icon}
        </div>
        <div className="min-w-0 flex-1">{title}</div>
        {badge ? (
          <Badge
            variant={badgeVariant}
            className="shrink-0 uppercase tracking-wide"
          >
            {badge}
          </Badge>
        ) : null}
      </div>
      {actions ? (
        <div className="flex shrink-0 items-center gap-2 sm:pl-2">{actions}</div>
      ) : null}
    </div>
  );
}

export function NewSectionCard({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Card className={cnUdemyCard("border-dashed shadow-none")}>
      <CardHeader className="border-b border-[#d1d7dc] pb-4">
        <CardTitle className="text-base">Add a new section</CardTitle>
        <CardDescription>
          Create Section 1, Section 2, and so on. Each section holds numbered
          content units (1.1, 1.2) plus shared resources and a section assessment.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">{children}</CardContent>
    </Card>
  );
}

export function sectionItemCount(section: {
  lessons: unknown[];
  quizzes: unknown[];
  assignmentItems: unknown[];
  resources: unknown[];
}): number {
  return (
    section.lessons.length +
    section.quizzes.length +
    section.assignmentItems.length +
    section.resources.length
  );
}

export function formatSectionSummary(section: {
  lessons: unknown[];
  quizzes: unknown[];
  assignmentItems: unknown[];
  resources: unknown[];
}): string {
  const total = sectionItemCount(section);
  if (total === 0) return "No content yet";
  const parts: string[] = [];
  if (section.lessons.length > 0) {
    parts.push(
      `${section.lessons.length} content unit${section.lessons.length === 1 ? "" : "s"}`,
    );
  }
  if (section.resources.length > 0) {
    parts.push(
      `${section.resources.length} resource${section.resources.length === 1 ? "" : "s"}`,
    );
  }
  const assessments =
    section.quizzes.length + section.assignmentItems.length;
  if (assessments > 0) {
    parts.push(
      `${assessments} section assessment${assessments === 1 ? "" : "s"}`,
    );
  }
  return parts.join(" · ");
}
