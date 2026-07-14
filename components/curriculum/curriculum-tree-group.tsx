"use client";

import { ChevronRight, Folder, FolderOpen } from "lucide-react";
import type { ReactNode } from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

export type CurriculumGroupKind =
  | "content"
  | "quiz"
  | "assessments"
  | "resources";

const groupAccent: Record<CurriculumGroupKind, string> = {
  content: "border-l-primary",
  quiz: "border-l-amber-500",
  assessments: "border-l-amber-500",
  resources: "border-l-accent",
};

export function CurriculumTreeGroup({
  kind,
  title,
  count,
  defaultOpen = true,
  className,
  children,
}: {
  kind: CurriculumGroupKind;
  title: string;
  count?: number;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <Collapsible defaultOpen={defaultOpen} className={className}>
      <CollapsibleTrigger
        className={cn(
          "group/trigger flex w-full items-center gap-2 border-b border-border bg-muted/50 px-3 py-2 text-left text-xs font-semibold text-foreground transition-colors hover:bg-muted",
          "border-l-4",
          groupAccent[kind],
        )}
      >
        <ChevronRight className="h-3.5 w-3.5 shrink-0 transition-transform group-data-[state=open]/trigger:rotate-90" />
        <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground group-data-[state=open]/trigger:hidden" />
        <FolderOpen className="hidden h-3.5 w-3.5 shrink-0 text-primary group-data-[state=open]/trigger:block" />
        <span className="min-w-0 flex-1 truncate">{title}</span>
        {count !== undefined && count > 0 ? (
          <span className="shrink-0 tabular-nums text-[10px] text-muted-foreground">
            {count}
          </span>
        ) : null}
      </CollapsibleTrigger>
      <CollapsibleContent>{children}</CollapsibleContent>
    </Collapsible>
  );
}

export function CurriculumTreeChildren({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-l border-border/80 bg-background py-0.5 pl-3 ml-3",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CurriculumTreeRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "border-b border-border/60 last:border-b-0 hover:bg-muted/40",
        className,
      )}
    >
      {children}
    </div>
  );
}
