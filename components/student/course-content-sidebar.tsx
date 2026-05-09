"use client";

import React, { useMemo, useState } from "react";
import { clsx } from "clsx";
import { ChevronDown, ChevronRight, Circle, ExternalLink, FileText, Link2, Play } from "lucide-react";
import Link from "next/link";
import { formatLessonDuration } from "@/lib/lesson-duration";
import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";
import { useProgress } from "@/lib/student/progress-context";

export type SidebarLesson = {
  id: string;
  title: string;
  videoUrl: string | null;
  content: string | null;
  durationSec: number | null;
};

export type SidebarSection = {
  id: string;
  title: string;
  lessons: SidebarLesson[];
  resources?: SectionResource[];
};

/** Parse resources out of the section description JSON (same logic as curriculum editor) */
function parseSectionResources(description: string | null | undefined): SectionResource[] {
  if (!description) return [];
  try {
    const p = JSON.parse(description) as { resources?: SectionResource[] };
    return Array.isArray(p.resources) ? p.resources : [];
  } catch {
    return [];
  }
}

export function CourseContentSidebar({
  courseId,
  sections,
  selectedLessonId,
  progressMap: initialProgressMap,
  intelHeading = "Course outline",
  intelBadge = "Progress",
}: {
  courseId: string;
  sections: (SidebarSection & { description?: string | null })[];
  selectedLessonId: string | null;
  progressMap: Record<string, boolean>;
  intelHeading?: string;
  intelBadge?: string;
}) {
  const { progressMap: contextMap } = useProgress();
  const progressMap = contextMap || initialProgressMap;

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sections) init[s.id] = true;
    return init;
  });

  const stats = useMemo(() => {
    let total = 0;
    let done = 0;
    for (const s of sections) {
      for (const l of s.lessons) {
        total += 1;
        if (progressMap[l.id]) done += 1;
      }
    }
    return { total, done };
  }, [sections, progressMap]);

  return (
    <div className="flex h-full min-h-0 flex-col bg-[var(--surface)] overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[var(--border-subtle)] px-5 pb-5 pt-6">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <h2 className="font-display text-[13px] font-extrabold uppercase tracking-[0.1em] text-[var(--primary)]">
            {intelHeading}
          </h2>
          <span className="rounded-[2px] bg-[var(--primary-soft)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[var(--primary-soft-text)]">
            {intelBadge}
          </span>
        </div>
        <p className="mt-2 text-xs text-[var(--muted)]">
          {stats.done}/{stats.total} completed
        </p>
      </div>

      {/* Scrollable nav */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {sections.map((section, si) => {
          const sectionDone = section.lessons.filter((l) => progressMap[l.id]).length;
          const isOpen = open[section.id] ?? true;
          const resources =
            section.resources && section.resources.length > 0
              ? section.resources
              : parseSectionResources((section as { description?: string | null }).description);

          return (
            <div key={section.id} className="mb-1">
              <button
                type="button"
                onClick={() => setOpen((o) => ({ ...o, [section.id]: !isOpen }))}
                className="flex w-full items-center gap-2 rounded-[var(--radius-md)] px-2 py-2 text-left text-sm font-bold text-[var(--foreground)] hover:bg-[var(--surface-muted)]"
              >
                {isOpen ? (
                  <ChevronDown className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                ) : (
                  <ChevronRight className="h-4 w-4 shrink-0 text-[var(--muted)]" />
                )}
                <span className="min-w-0 flex-1">
                  Section {si + 1}: {section.title}
                </span>
                <span className="shrink-0 text-[11px] font-normal text-[var(--muted)]">
                  {sectionDone}/{section.lessons.length}
                </span>
              </button>

              {isOpen ? (
                <div className="ml-1 border-l border-[var(--border)] pl-2">
                  <ul>
                    {section.lessons.map((lesson) => {
                      const active = lesson.id === selectedLessonId;
                      const done = progressMap[lesson.id];
                      const isVideo = Boolean(lesson.videoUrl);
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={`/student/course/${courseId}?lesson=${lesson.id}`}
                            className={clsx(
                              "flex items-start gap-2 rounded-[var(--radius-md)] px-2 py-2 text-xs leading-snug transition",
                              active
                                ? "bg-[var(--primary-soft)] font-semibold text-[var(--foreground)] ring-1 ring-[var(--border)]"
                                : "text-[var(--foreground)] hover:bg-[var(--surface-muted)]",
                            )}
                          >
                            <span className="mt-0.5 shrink-0 text-[var(--muted)]">
                              {done ? (
                                <span className="inline-flex h-4 w-4 items-center justify-center rounded border border-[var(--success)] bg-[var(--success-soft)] text-[10px] text-[var(--success)] font-black">
                                  ✓
                                </span>
                              ) : (
                                <Circle className="h-4 w-4" strokeWidth={1.5} />
                              )}
                            </span>
                            <span className="min-w-0 flex-1">
                              <span className="mr-1 inline-block align-middle text-[var(--muted)]">
                                {isVideo ? (
                                  <Play className="inline h-3.5 w-3.5" fill="currentColor" />
                                ) : (
                                  <FileText className="inline h-3.5 w-3.5" strokeWidth={2} />
                                )}
                              </span>
                              <span className="align-middle">{lesson.title}</span>
                              {formatLessonDuration(lesson.durationSec) ? (
                                <span className="mt-0.5 block text-[11px] font-normal text-[var(--muted)]">
                                  {formatLessonDuration(lesson.durationSec)}
                                </span>
                              ) : null}
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {resources.length > 0 && (
                    <div className="my-1.5 rounded-md border border-emerald-100 bg-emerald-50/60 px-2.5 py-2">
                      <p className="mb-1.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                        Resources
                      </p>
                      <ul className="space-y-1">
                        {resources.map((r) => (
                          <li key={r.id}>
                            <a
                              href={r.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1.5 text-[11px] font-medium text-emerald-800 hover:underline"
                            >
                              {r.type === "LINK" ? (
                                <Link2 className="h-3 w-3 shrink-0 text-emerald-500" />
                              ) : (
                                <FileText className="h-3 w-3 shrink-0 text-emerald-500" />
                              )}
                              <span className="min-w-0 flex-1 truncate">{r.title}</span>
                              <ExternalLink className="h-2.5 w-2.5 shrink-0 text-emerald-400" />
                            </a>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ) : null}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
