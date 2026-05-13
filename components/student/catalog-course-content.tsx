"use client";

import { ChevronDown, ClipboardList, HelpCircle, Play } from "lucide-react";
import { useCallback, useState } from "react";
import {
  formatLessonDuration,
  formatTotalDuration,
} from "@/lib/lesson-duration";
import { cn } from "@/lib/utils";

export type CatalogContentLesson = {
  id: string;
  title: string;
  durationSec: number | null;
};

export type CatalogContentQuiz = { id: string; title: string };

export type CatalogContentSection = {
  id: string;
  title: string;
  lessons: CatalogContentLesson[];
  quizzes: CatalogContentQuiz[];
};

export type CatalogContentAssignment = {
  id: string;
  title: string;
  description: string | null;
};

function sectionSeconds(lessons: CatalogContentLesson[]) {
  return lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0);
}

export function CatalogCourseContent({
  sections,
  assignments,
  contentSummary,
  totalLectures,
  totalQuizzes,
  totalAssignments,
}: {
  sections: CatalogContentSection[];
  assignments: CatalogContentAssignment[];
  contentSummary: string;
  totalLectures: number;
  totalQuizzes: number;
  totalAssignments: number;
}) {
  const firstId = sections[0]?.id;
  const [open, setOpen] = useState<Set<string>>(() =>
    firstId ? new Set([firstId]) : new Set(),
  );

  const allOpen = sections.length > 0 && sections.every((s) => open.has(s.id));

  const toggleSection = useCallback((id: string) => {
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const expandCollapseAll = useCallback(() => {
    if (allOpen) {
      setOpen(firstId ? new Set([firstId]) : new Set());
    } else {
      setOpen(new Set(sections.map((s) => s.id)));
    }
  }, [allOpen, firstId, sections]);

  if (sections.length === 0) {
    return (
      <section className="space-y-3">
        <h2 className="text-[1.375rem] font-bold tracking-tight text-[var(--foreground)]">
          Course content
        </h2>
        <p className="text-sm text-[var(--muted-soft)]">No sections yet.</p>
      </section>
    );
  }

  return (
    <section className="space-y-0">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-[1.375rem] font-bold leading-snug tracking-tight text-[var(--foreground)]">
            Course content
          </h2>
          <p className="mt-1 text-sm text-[var(--muted-soft)]">
            {contentSummary}
          </p>
        </div>
        <button
          type="button"
          onClick={expandCollapseAll}
          className="shrink-0 text-left text-sm font-bold text-[var(--primary)] underline decoration-[var(--primary)] underline-offset-2 hover:text-[var(--primary-strong)] sm:text-right"
        >
          {allOpen ? "Collapse all sections" : "Expand all sections"}
        </button>
      </div>

      <div className="border border-[#d1d7dc] bg-[var(--surface)]">
        {sections.map((section) => {
          const sectionAssignments = assignments.filter((a) =>
            a.description?.includes(`Section:${section.id}`),
          );
          const secSecs = sectionSeconds(section.lessons);
          const durLabel = secSecs > 0 ? formatTotalDuration(secSecs) : "—";
          const isOpen = open.has(section.id);
          const lectureCount = section.lessons.length;
          const subLine = `${lectureCount} lecture${lectureCount === 1 ? "" : "s"} · ${durLabel}`;

          return (
            <div
              key={section.id}
              className="border-b border-[#d1d7dc] last:border-b-0"
            >
              <button
                type="button"
                onClick={() => toggleSection(section.id)}
                className="flex w-full items-start gap-3 bg-[#f7f9fa] px-4 py-4 text-left transition-colors hover:bg-[#eceff1] sm:items-center"
              >
                <ChevronDown
                  className={cn(
                    "mt-0.5 h-4 w-4 shrink-0 text-[var(--foreground)] transition-transform sm:mt-0",
                    isOpen ? "rotate-180" : "",
                  )}
                  aria-hidden
                />
                <span className="min-w-0 flex-1 font-bold text-[var(--foreground)]">
                  {section.title}
                </span>
                <span className="shrink-0 text-right text-xs font-normal text-[var(--muted-soft)] sm:text-sm">
                  {subLine}
                </span>
              </button>
              {isOpen ? (
                <ul className="divide-y divide-[#d1d7dc] bg-[var(--surface)]">
                  {section.lessons.map((lesson) => (
                    <li
                      key={lesson.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 pl-10 text-sm hover:bg-[#f7f9fa]"
                    >
                      <span className="flex min-w-0 items-center gap-3 text-[var(--foreground)]">
                        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-[#d1d7dc] bg-[var(--surface)]">
                          <Play
                            className="h-2.5 w-2.5 text-[var(--foreground)]"
                            fill="currentColor"
                            aria-hidden
                          />
                        </span>
                        <span className="truncate font-normal">
                          {lesson.title}
                        </span>
                      </span>
                      <span className="shrink-0 tabular-nums text-xs text-[var(--muted-soft)]">
                        {formatLessonDuration(lesson.durationSec ?? 0)}
                      </span>
                    </li>
                  ))}
                  {section.quizzes.map((quiz) => (
                    <li
                      key={quiz.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 pl-10 text-sm hover:bg-[#f7f9fa]"
                    >
                      <span className="flex min-w-0 items-center gap-3 text-[var(--foreground)]">
                        <HelpCircle
                          className="h-4 w-4 shrink-0 text-[var(--muted-soft)]"
                          aria-hidden
                        />
                        <span className="truncate">{quiz.title}</span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted-soft)]">
                        Quiz
                      </span>
                    </li>
                  ))}
                  {sectionAssignments.map((assignment) => (
                    <li
                      key={assignment.id}
                      className="flex items-center justify-between gap-4 px-6 py-3 pl-10 text-sm hover:bg-[#f7f9fa]"
                    >
                      <span className="flex min-w-0 items-center gap-3 text-[var(--foreground)]">
                        <ClipboardList
                          className="h-4 w-4 shrink-0 text-[var(--muted-soft)]"
                          aria-hidden
                        />
                        <span className="truncate">{assignment.title}</span>
                      </span>
                      <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-[var(--muted-soft)]">
                        Task
                      </span>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          );
        })}
      </div>

      <p className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1 text-xs text-[var(--muted-soft)]">
        <span className="inline-flex items-center gap-1">
          <Play className="h-3.5 w-3.5" fill="currentColor" aria-hidden />
          {totalLectures} lectures
        </span>
        <span className="inline-flex items-center gap-1">
          <HelpCircle className="h-3.5 w-3.5" aria-hidden />
          {totalQuizzes} quizzes
        </span>
        <span className="inline-flex items-center gap-1">
          <ClipboardList className="h-3.5 w-3.5" aria-hidden />
          {totalAssignments} tasks
        </span>
      </p>
    </section>
  );
}
