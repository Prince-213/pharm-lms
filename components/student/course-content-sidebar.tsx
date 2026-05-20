"use client";

import { clsx } from "clsx";
import {
  ChevronDown,
  ChevronsDownUp,
  Circle,
  Download,
  ExternalLink,
  Link2,
  CheckCircle2,
} from "lucide-react";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import {
  CourseLessonNavGroup,
  type CourseLessonNav,
} from "@/components/student/course-lesson-nav-group";
import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";
import type { CatalogResourceItem } from "@/lib/course-catalog-detail";
import { formatLessonDuration } from "@/lib/lesson-duration";
import {
  formatResourceMetaLine,
  resourceDownloadFilename,
} from "@/lib/section-resource-meta";
import { useProgress } from "@/lib/student/progress-context";
import { SectionQuizLauncher } from "@/components/student/section-quiz-launcher";
import { Badge } from "@/components/ui/badge";

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
  /** From server with signed URLs; if omitted, parsed from `description` (no R2 resolve). */
  resources?: CatalogResourceItem[];
  quizzes?: { id: string; title: string; questions: unknown }[];
};

function parseSectionResources(
  description: string | null | undefined,
): SectionResource[] {
  if (!description) return [];
  try {
    const p = JSON.parse(description) as { resources?: SectionResource[] };
    return Array.isArray(p.resources) ? p.resources : [];
  } catch {
    return [];
  }
}

function effectiveResourceHref(
  r: SectionResource & { href?: string | null },
): string | null {
  if (r.href) return r.href;
  const u = r.url?.trim();
  if (
    u?.startsWith("https://") ||
    u?.startsWith("http://") ||
    u?.startsWith("/")
  ) {
    return u;
  }
  return null;
}

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

export function CourseContentSidebar({
  courseId,
  sections,
  selectedLessonId,
  progressMap: initialProgressMap,
  intelHeading = "Course outline",
  intelBadge = "Progress",
  currentTab = "overview",
  lessonNav,
}: {
  courseId: string;
  sections: SidebarSection[];
  selectedLessonId: string | null;
  progressMap: Record<string, boolean>;
  intelHeading?: string;
  intelBadge?: string;
  currentTab?: string;
  /** Desktop sidebar: prev/next lesson controls above search. */
  lessonNav?: CourseLessonNav | null;
}) {
  const { progressMap: contextMap } = useProgress();
  const progressMap = contextMap || initialProgressMap;

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sections) init[s.id] = true;
    return init;
  });

  const allSectionsOpen =
    sections.length > 0 && sections.every((s) => open[s.id] ?? true);

  const expandCollapseAll = useCallback(() => {
    if (allSectionsOpen) {
      const firstId = sections[0]?.id;
      const next: Record<string, boolean> = {};
      for (const s of sections) next[s.id] = s.id === firstId;
      setOpen(next);
    } else {
      const next: Record<string, boolean> = {};
      for (const s of sections) next[s.id] = true;
      setOpen(next);
    }
  }, [allSectionsOpen, sections]);

  const [filterQuery, setFilterQuery] = useState("");

  const filteredSections = useMemo(() => {
    const q = filterQuery.trim().toLowerCase();
    if (!q) return sections;
    return sections
      .map((s) => ({
        ...s,
        lessons: s.lessons.filter((l) => l.title.toLowerCase().includes(q)),
      }))
      .filter((s) => s.lessons.length > 0);
  }, [sections, filterQuery]);

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

  return (
    <div className="flex h-full min-h-0 flex-col bg-transparent">
      {/* ─── Header ─── */}
      <div className="shrink-0 px-5 pb-4 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="font-display text-[11px] font-extrabold uppercase tracking-[0.12em] text-[var(--primary)]">
            {intelHeading}
          </h2>
          <Badge variant="mint" className="text-[10px] py-0 px-2 h-5">
            {intelBadge}
          </Badge>
        </div>

        <div className="mt-4 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-slate-500 uppercase tracking-wider">Progress</span>
            <span className="font-black text-[var(--primary)] tracking-tighter">{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100/50 ring-1 ring-slate-200/50">
            <div
              className="h-full rounded-full bg-[var(--primary)] transition-all duration-700 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>

        {lessonNav ? (
          <div className="mt-4 hidden lg:block">
            <CourseLessonNavGroup variant="sidebar" {...lessonNav} />
          </div>
        ) : null}

        <div
          className={clsx(
            "flex items-center justify-between gap-2",
            lessonNav ? "mt-3 lg:mt-4" : "mt-5",
          )}
        >
          <button
            type="button"
            onClick={expandCollapseAll}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-[var(--primary)] transition hover:bg-[var(--primary-soft)]/30"
          >
            <ChevronsDownUp className="h-3.5 w-3.5 shrink-0" aria-hidden />
            {allSectionsOpen ? "Collapse all" : "Expand all"}
          </button>
        </div>

        <div className="mt-3">
          <div className="relative">
            <input
              type="search"
              value={filterQuery}
              onChange={(e) => setFilterQuery(e.target.value)}
              placeholder="Search lessons…"
              className={clsx(
                "w-full rounded-xl border border-slate-200/60 bg-slate-50/50 px-4 py-2.5 text-xs text-[var(--foreground)]",
                "placeholder:text-slate-400 font-medium",
                "transition-all duration-200",
                "focus:border-[var(--primary)] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[var(--primary-soft)]/20",
              )}
            />
          </div>
        </div>
      </div>

      {/* ─── Curriculum List ─── */}
      <nav className="min-h-0 flex-1 px-3 py-3" aria-label="Course curriculum">
        {filteredSections.map((section) => {
          const si = sections.findIndex((x) => x.id === section.id);
          const sectionDone = section.lessons.filter(
            (l) => progressMap[l.id],
          ).length;
          const isOpen = open[section.id] ?? true;

          return (
            <div key={section.id} className="mb-1">
              <button
                type="button"
                onClick={() =>
                  setOpen((o) => ({ ...o, [section.id]: !isOpen }))
                }
                className={clsx(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-all duration-200",
                  "hover:bg-slate-100/50",
                  isOpen && "bg-slate-100/30",
                )}
              >
                <div className={clsx(
                  "flex h-6 w-6 items-center justify-center rounded-lg bg-white shadow-sm ring-1 ring-slate-200/50 transition-transform duration-300",
                  isOpen ? "rotate-0 shadow-inner" : "-rotate-90"
                )}>
                  <ChevronDown className="h-3 w-3 text-slate-500" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-black uppercase tracking-[0.1em] text-slate-400">
                    Section {si + 1}
                  </p>
                  <p className="truncate text-xs font-bold text-slate-700">
                    {section.title}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  {section.quizzes && section.quizzes.length > 0 ? (
                    <SectionQuizLauncher
                      quizzes={section.quizzes}
                      triggerVariant="section-badge"
                    />
                  ) : null}
                  <span className="text-[10px] font-black tabular-nums text-[var(--primary)] bg-[var(--primary-soft)]/10 px-2 py-1 rounded-md">
                    {sectionDone}/{section.lessons.length}
                  </span>
                </div>
              </button>

              {isOpen && (
                <div className="ml-6 mt-1 space-y-1 border-l-2 border-slate-100/80 pl-4 py-1">
                  <ul className="space-y-1">
                    {section.lessons.map((lesson) => {
                      const active = lesson.id === selectedLessonId;
                      const done = progressMap[lesson.id];
                      const isVideo = Boolean(lesson.videoUrl);
                      return (
                        <li key={lesson.id}>
                          <Link
                            href={buildLessonHref(
                              courseId,
                              lesson.id,
                              currentTab,
                            )}
                            className={clsx(
                              "group flex items-start gap-3 rounded-xl px-3 py-2.5 text-[13px] leading-relaxed transition-all duration-200 active:scale-[0.98]",
                              active
                                ? "bg-[#b1f0ce]/15 text-[#0f5238] font-bold ring-1 ring-[#b1f0ce]/40"
                                : "text-slate-600 hover:bg-slate-50 hover:text-slate-900",
                            )}
                          >
                            <span className="mt-1 shrink-0">
                              {done ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" strokeWidth={2.5} />
                              ) : (
                                <Circle className="h-4 w-4 text-slate-300 group-hover:text-slate-400" strokeWidth={2} />
                              )}
                            </span>
                            <div className="min-w-0 flex-1">
                              <span className="block truncate">{lesson.title}</span>
                              <div className="mt-1 flex items-center gap-2">
                                <Badge variant={active ? "mint" : "outline"} className="text-[9px] h-4 px-1.5 font-bold uppercase tracking-tighter">
                                  {isVideo ? "Video" : "Article"}
                                </Badge>
                                {lesson.durationSec && (
                                  <span className="text-[10px] font-medium text-slate-400 tabular-nums">
                                    {formatLessonDuration(lesson.durationSec)}
                                  </span>
                                )}
                              </div>
                            </div>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>

                  {/* ─── Section Resources ─── */}
                  {(section.resources || []).length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 pr-2">
                       <p className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Resources</p>
                       <ul className="space-y-1">
                          {section.resources?.map((res, idx) => (
                             <li key={`${res.id}-${idx}`}>
                                <a 
                                   href={res.href || "#"} 
                                   target="_blank" 
                                   rel="noopener noreferrer"
                                   className="flex items-center gap-3 rounded-lg px-3 py-2 text-[11px] font-medium text-slate-500 transition-colors hover:bg-slate-50 hover:text-[var(--primary)]"
                                >
                                   {res.type === "LINK" ? (
                                      <Link2 className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                   ) : (
                                      <Download className="h-3.5 w-3.5 shrink-0 opacity-60" />
                                   ) }
                                   <span className="truncate">{res.title}</span>
                                   <ExternalLink className="ml-auto h-3 w-3 opacity-0 group-hover:opacity-40" />
                                </a>
                             </li>
                          ))}
                       </ul>
                    </div>
                  )}
                  
                  {/* ─── Section Quizzes ─── */}
                  {(section.quizzes || []).length > 0 && (
                    <div className="mt-3 space-y-2 border-t border-slate-100 pt-3 pr-2">
                       <p className="px-3 text-[9px] font-black uppercase tracking-widest text-slate-400">Section Quizzes</p>
                       <ul className="space-y-1">
                          {section.quizzes?.map((quiz) => (
                             <li key={quiz.id}>
                                <SectionQuizLauncher
                                  quizzes={section.quizzes ?? []}
                                  triggerVariant="sidebar-link"
                                  defaultQuizId={quiz.id}
                                  quizTitle={quiz.title}
                                />
                             </li>
                          ))}
                       </ul>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </nav>
    </div>
  );
}
