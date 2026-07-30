"use client";

import {
  CheckCircle2,
  ChevronDown,
  Download,
  ExternalLink,
  FileText,
  HelpCircle,
  Link2,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  CurriculumTreeChildren,
  CurriculumTreeGroup,
  CurriculumTreeRow,
} from "@/components/curriculum/curriculum-tree-group";
import {
  CourseLessonNavGroup,
  type CourseLessonNav,
} from "@/components/student/course-lesson-nav-group";
import type { CatalogResourceItem } from "@/lib/course-catalog-detail";
import {
  formatLessonDuration,
  formatTotalDuration,
} from "@/lib/lesson-duration";
import {
  formatResourceSizeLabel,
  resourceDisplayName,
  resourceDownloadFilename,
} from "@/lib/section-resource-meta";
import { useProgress } from "@/lib/student/progress-context";
import { SectionQuizLauncher } from "@/components/student/section-quiz-launcher";
import { SkipSectionLessonLink } from "@/components/student/skip-section-lesson-link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { cnUdemyInput } from "@/lib/ui/udemy-surface";

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
  description?: string | null;
  resources?: CatalogResourceItem[];
  quizzes?: { id: string; title: string; questions: unknown }[];
};

function buildLessonHref(
  courseId: string,
  lessonId: string,
  currentTab: string,
): string {
  const p = new URLSearchParams();
  p.set("lesson", lessonId);
  if (currentTab !== "overview") p.set("tab", currentTab);
  return `/student/course/${courseId}?${p.toString()}`;
}

function sectionSeconds(lessons: SidebarLesson[]) {
  return lessons.reduce((s, l) => s + (l.durationSec ?? 0), 0);
}

function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function flatLessonIndex(sections: SidebarSection[], lessonId: string): number {
  let index = 0;
  for (const section of sections) {
    for (const lesson of section.lessons) {
      if (lesson.id === lessonId) return index;
      index += 1;
    }
  }
  return -1;
}

export function CourseContentSidebar({
  courseId,
  sections,
  selectedLessonId,
  progressMap: initialProgressMap,
  intelHeading = "Course content",
  intelBadge = "Progress",
  currentTab = "overview",
  lessonNav,
  currentSectionId = null,
  sectionQuizPassedIds = [],
  sectionOrder = [],
}: {
  courseId: string;
  sections: SidebarSection[];
  selectedLessonId: string | null;
  progressMap: Record<string, boolean>;
  intelHeading?: string;
  intelBadge?: string;
  currentTab?: string;
  lessonNav?: CourseLessonNav | null;
  currentSectionId?: string | null;
  sectionQuizPassedIds?: string[];
  sectionOrder?: string[];
}) {
  const { progressMap: contextMap } = useProgress();
  const progressMap = contextMap || initialProgressMap;

  const firstId = sections[0]?.id;
  const initialOpenId = currentSectionId ?? firstId ?? null;
  const [open, setOpen] = useState<Set<string>>(() =>
    initialOpenId ? new Set([initialOpenId]) : new Set(),
  );

  useEffect(() => {
    if (!currentSectionId) return;
    setOpen((prev) => {
      if (prev.has(currentSectionId)) return prev;
      return new Set([currentSectionId]);
    });
  }, [currentSectionId]);

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
      setOpen(initialOpenId ? new Set([initialOpenId]) : new Set());
    } else {
      setOpen(new Set(sections.map((s) => s.id)));
    }
  }, [allOpen, initialOpenId, sections]);

  const passedQuizSet = useMemo(
    () => new Set(sectionQuizPassedIds),
    [sectionQuizPassedIds],
  );

  const currentSectionIndex = useMemo(() => {
    if (!currentSectionId) return -1;
    return sectionOrder.indexOf(currentSectionId);
  }, [currentSectionId, sectionOrder]);

  const [filterQuery, setFilterQuery] = useState("");

  function shouldConfirmSkip(targetSectionId: string) {
    if (currentSectionIndex < 0) return false;
    const targetIndex = sectionOrder.indexOf(targetSectionId);
    if (targetIndex <= currentSectionIndex) return false;
    if (!currentSectionId) return false;
    const currentSection = sections.find((s) => s.id === currentSectionId);
    if (!currentSection?.quizzes?.length) return false;
    return !passedQuizSet.has(currentSectionId);
  }

  const filteredSections = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => {
        const lessons = s.lessons.filter((l) => l.title.toLowerCase().includes(q));
        const resources = (s.resources ?? []).filter((r) =>
          resourceDisplayName(r).toLowerCase().includes(q),
        );
        const quizzes = (s.quizzes ?? []).filter((quiz) =>
          quiz.title.toLowerCase().includes(q),
        );
        const sectionMatches = s.title.toLowerCase().includes(q);
        return {
          ...s,
          lessons: sectionMatches ? s.lessons : lessons,
          resources: sectionMatches ? s.resources : resources,
          quizzes: sectionMatches ? s.quizzes : quizzes,
        };
      })
      .filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.lessons.length > 0 ||
          (s.resources?.length ?? 0) > 0 ||
          (s.quizzes?.length ?? 0) > 0,
      );
  }, [sections, filterQuery]);

  function renderResourceRow(res: CatalogResourceItem, idx: number) {
    const name = resourceDisplayName(res);
    const sizeLabel = formatResourceSizeLabel(res);
    return (
      <CurriculumTreeRow key={`${res.id}-${idx}`} className="min-w-0 px-1.5 py-0.5">
        <div className="flex h-10 min-w-0 items-center gap-2 overflow-hidden rounded-md border border-border bg-card px-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm border border-border bg-muted text-primary">
            {res.type === "FILE" ? (
              <FileText className="h-3.5 w-3.5" />
            ) : (
              <Link2 className="h-3.5 w-3.5" />
            )}
          </div>
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="truncate text-xs font-semibold leading-tight" title={name}>
              {name}
            </p>
            <p
              className="mt-0.5 truncate text-[10px] leading-none text-muted-foreground"
              title={sizeLabel}
            >
              {sizeLabel}
            </p>
          </div>
          {res.href ? (
            res.type === "FILE" ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                asChild
              >
                <a
                  href={res.href}
                  download={resourceDownloadFilename(res)}
                  aria-label={`Download ${name}`}
                >
                  <Download className="h-3.5 w-3.5" />
                </a>
              </Button>
            ) : (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 shrink-0"
                asChild
              >
                <a
                  href={res.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Open ${name}`}
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              </Button>
            )
          ) : null}
        </div>
      </CurriculumTreeRow>
    );
  }

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

  const pct = stats.total > 0 ? Math.round((stats.done / stats.total) * 100) : 0;
  const contentSummary = `${pluralize(stats.total, "lesson")} · ${pct}% complete`;

  return (
    <div className="flex h-full min-h-0 min-w-0 flex-col overflow-x-hidden bg-card">
      <div className="shrink-0 px-4 pb-3 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-base font-bold text-foreground">{intelHeading}</h2>
          <span className="text-[10px] font-bold uppercase tracking-wide text-primary">
            {intelBadge}
          </span>
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{contentSummary}</p>

        <div className="mt-3 space-y-1">
          <Progress value={pct} className="h-1.5" />
        </div>

        {lessonNav ? (
          <div className="mt-3 hidden lg:block">
            <CourseLessonNavGroup variant="sidebar" {...lessonNav} />
          </div>
        ) : null}

        <div className="mt-3 flex items-center justify-between gap-2">
          <Button
            type="button"
            variant="link"
            onClick={expandCollapseAll}
            className="h-auto p-0 text-xs font-bold text-primary"
          >
            {allOpen ? "Collapse all" : "Expand all"}
          </Button>
        </div>

        <div className="mt-2">
          <Input
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search lessons…"
            className={cnUdemyInput("h-9 text-xs")}
          />
        </div>
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-3 pb-4"
        aria-label="Course curriculum"
      >
        <div className="border border-border bg-card">
          {filteredSections.map((section, sectionIndex) => {
            const secSecs = sectionSeconds(section.lessons);
            const durLabel = secSecs > 0 ? formatTotalDuration(secSecs) : "—";
            const isOpen = open.has(section.id);
            const sectionDone = section.lessons.filter(
              (l) => progressMap[l.id],
            ).length;
            const quizCount = section.quizzes?.length ?? 0;
            const resourceCount = section.resources?.length ?? 0;
            const metaParts = [
              `${sectionDone}/${section.lessons.length} complete`,
              durLabel,
              resourceCount > 0 ? pluralize(resourceCount, "resource") : null,
              quizCount > 0 ? pluralize(quizCount, "quiz") : null,
            ].filter(Boolean);
            const subLine = metaParts.join(" • ");

            return (
              <div
                key={section.id}
                className="border-b border-border last:border-b-0"
              >
                <button
                  type="button"
                  onClick={() => toggleSection(section.id)}
                  className="flex w-full items-start gap-2 bg-muted/50 px-3 py-3 text-left transition-colors hover:bg-muted sm:items-center"
                >
                  <ChevronDown
                    className={cn(
                      "mt-0.5 h-4 w-4 shrink-0 transition-transform sm:mt-0",
                      isOpen ? "rotate-180" : "",
                    )}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-xs font-bold text-foreground">
                      {`Section ${sectionIndex + 1}: ${section.title}`}
                    </span>
                    <span className="mt-0.5 block truncate text-[10px] leading-relaxed text-muted-foreground">
                      {subLine}
                    </span>
                  </span>
                </button>

                {isOpen ? (
                  <div className="bg-background">
                    {section.lessons.length > 0 ? (
                      <CurriculumTreeGroup
                        kind="content"
                        title="Lessons"
                        count={section.lessons.length}
                        defaultOpen
                      >
                        <CurriculumTreeChildren>
                          <ul className="list-none">
                            {section.lessons.map((lesson) => {
                              const active = lesson.id === selectedLessonId;
                              const done = progressMap[lesson.id];
                              const isVideo = Boolean(lesson.videoUrl);
                              const lessonHref = buildLessonHref(
                                courseId,
                                lesson.id,
                                currentTab,
                              );
                              const confirmSkip = shouldConfirmSkip(section.id);
                              const lessonIndex = flatLessonIndex(
                                sections,
                                lesson.id,
                              );
                              const selectedIndex = selectedLessonId
                                ? flatLessonIndex(sections, selectedLessonId)
                                : -1;
                              const locked =
                                selectedIndex >= 0 &&
                                lessonIndex > selectedIndex + 1;

                              const rowClass = cn(
                                "flex w-full items-center justify-between gap-2 px-2 py-2.5 text-sm transition-colors hover:bg-muted/60",
                                active &&
                                  "border-l-2 border-l-primary bg-muted/80 font-semibold text-primary",
                                locked && "opacity-50",
                              );

                              const rowBody = (
                                <>
                                  <span className="flex min-w-0 items-center gap-2">
                                    {done ? (
                                      <CheckCircle2
                                        className="h-4 w-4 shrink-0 text-primary"
                                        aria-hidden
                                      />
                                    ) : (
                                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded border border-border bg-card">
                                        {isVideo ? (
                                          <Play
                                            className="h-2.5 w-2.5"
                                            fill="currentColor"
                                            aria-hidden
                                          />
                                        ) : (
                                          <FileText
                                            className="h-2.5 w-2.5"
                                            aria-hidden
                                          />
                                        )}
                                      </span>
                                    )}
                                    <span className="truncate">
                                      {lesson.title}
                                    </span>
                                  </span>
                                  {lesson.durationSec ? (
                                    <span className="shrink-0 text-[10px] tabular-nums text-muted-foreground">
                                      {formatLessonDuration(lesson.durationSec)}
                                    </span>
                                  ) : null}
                                </>
                              );

                              return (
                                <CurriculumTreeRow key={lesson.id}>
                                  {confirmSkip ? (
                                    <SkipSectionLessonLink
                                      href={lessonHref}
                                      shouldConfirm
                                      currentSectionTitle={section.title}
                                      className={rowClass}
                                    >
                                      {rowBody}
                                    </SkipSectionLessonLink>
                                  ) : (
                                    <Link href={lessonHref} className={rowClass}>
                                      {rowBody}
                                    </Link>
                                  )}
                                </CurriculumTreeRow>
                              );
                            })}
                          </ul>
                        </CurriculumTreeChildren>
                      </CurriculumTreeGroup>
                    ) : null}

                    {resourceCount > 0 ? (
                      <CurriculumTreeGroup
                        kind="resources"
                        title="Resources"
                        count={resourceCount}
                        defaultOpen={resourceCount <= 2}
                      >
                        <CurriculumTreeChildren>
                          {(section.resources ?? []).map((res, idx) =>
                            renderResourceRow(res, idx),
                          )}
                        </CurriculumTreeChildren>
                      </CurriculumTreeGroup>
                    ) : null}

                    {quizCount > 0 ? (
                      <CurriculumTreeGroup
                        kind="quiz"
                        title="Section quiz"
                        count={quizCount}
                        defaultOpen={false}
                      >
                        <CurriculumTreeChildren>
                          <ul className="list-none">
                            {(section.quizzes ?? []).map((quiz) => (
                              <CurriculumTreeRow key={quiz.id}>
                                <div className="flex items-center justify-between gap-2 px-2 py-2.5 text-sm hover:bg-muted/60">
                                  <SectionQuizLauncher
                                    quizzes={section.quizzes ?? []}
                                    triggerVariant="sidebar-link"
                                    defaultQuizId={quiz.id}
                                    quizTitle={quiz.title}
                                  />
                                </div>
                              </CurriculumTreeRow>
                            ))}
                          </ul>
                        </CurriculumTreeChildren>
                      </CurriculumTreeGroup>
                    ) : null}

                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
