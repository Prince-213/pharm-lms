"use client";

import { clsx } from "clsx";
import {
  ChevronDown,
  ChevronRight,
  Circle,
  Download,
  ExternalLink,
  FileText,
  Link2,
  Play,
} from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";
import type { CatalogResourceItem } from "@/lib/course-catalog-detail";
import { formatLessonDuration } from "@/lib/lesson-duration";
import {
  formatResourceMetaLine,
  resourceDownloadFilename,
} from "@/lib/section-resource-meta";
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
  description?: string | null;
  /** From server with signed URLs; if omitted, parsed from `description` (no R2 resolve). */
  resources?: CatalogResourceItem[];
};

/** Parse resources out of the section description JSON (same logic as curriculum editor) */
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
}: {
  courseId: string;
  sections: SidebarSection[];
  selectedLessonId: string | null;
  progressMap: Record<string, boolean>;
  intelHeading?: string;
  intelBadge?: string;
  currentTab?: string;
}) {
  const { progressMap: contextMap } = useProgress();
  const progressMap = contextMap || initialProgressMap;

  const [open, setOpen] = useState<Record<string, boolean>>(() => {
    const init: Record<string, boolean> = {};
    for (const s of sections) init[s.id] = true;
    return init;
  });

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
        <div className="mt-3">
          <label htmlFor="course-curriculum-filter" className="sr-only">
            Filter lessons by title
          </label>
          <input
            id="course-curriculum-filter"
            type="search"
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            placeholder="Search curriculum…"
            className="w-full rounded-md border border-[var(--border)] bg-[var(--background)] px-3 py-2 text-xs text-[var(--foreground)] placeholder:text-[var(--muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
        </div>
      </div>

      {/* Scrollable nav */}
      <nav className="min-h-0 flex-1 overflow-y-auto px-2 py-3">
        {filterQuery.trim() && filteredSections.length === 0 ? (
          <p className="px-2 py-6 text-center text-xs text-[var(--muted)]">
            No lessons match “{filterQuery.trim()}”.
          </p>
        ) : null}
        {filteredSections.map((section) => {
          const si = sections.findIndex((x) => x.id === section.id);
          const sectionDone = section.lessons.filter(
            (l) => progressMap[l.id],
          ).length;
          const isOpen = open[section.id] ?? true;
          const resources: CatalogResourceItem[] =
            section.resources ??
            parseSectionResources(section.description ?? null).map((r) => ({
              ...r,
              href: null,
            }));

          return (
            <div key={section.id} className="mb-1">
              <button
                type="button"
                onClick={() =>
                  setOpen((o) => ({ ...o, [section.id]: !isOpen }))
                }
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
                            href={buildLessonHref(
                              courseId,
                              lesson.id,
                              currentTab,
                            )}
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
                                  <Play
                                    className="inline h-3.5 w-3.5"
                                    fill="currentColor"
                                  />
                                ) : (
                                  <FileText
                                    className="inline h-3.5 w-3.5"
                                    strokeWidth={2}
                                  />
                                )}
                              </span>
                              <span className="align-middle">
                                {lesson.title}
                              </span>
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
                      <ul className="space-y-2">
                        {resources.map((r) => {
                          const href = effectiveResourceHref(r);
                          return (
                            <li key={r.id}>
                              <div className="flex items-start gap-2 rounded-md px-0.5 py-0.5">
                                <div className="mt-0.5 shrink-0 text-emerald-500">
                                  {r.type === "LINK" ? (
                                    <Link2 className="h-3.5 w-3.5" />
                                  ) : (
                                    <FileText className="h-3.5 w-3.5" />
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-[11px] font-semibold leading-snug text-emerald-900">
                                    {r.title}
                                  </p>
                                  <p className="mt-0.5 line-clamp-2 text-[10px] leading-snug text-emerald-800/85">
                                    {formatResourceMetaLine(r)}
                                  </p>
                                </div>
                                {href ? (
                                  r.type === "FILE" ? (
                                    <a
                                      href={href}
                                      download={resourceDownloadFilename(r)}
                                      className="shrink-0 rounded-md p-1.5 text-emerald-700 transition-colors hover:bg-emerald-100/80"
                                      title="Download"
                                      aria-label={`Download ${r.title}`}
                                    >
                                      <Download className="h-4 w-4" />
                                    </a>
                                  ) : (
                                    <a
                                      href={href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="shrink-0 rounded-md p-1.5 text-emerald-700 transition-colors hover:bg-emerald-100/80"
                                      title="Open link"
                                      aria-label={`Open link: ${r.title}`}
                                    >
                                      <ExternalLink className="h-4 w-4" />
                                    </a>
                                  )
                                ) : (
                                  <span
                                    className="shrink-0 rounded-md p-1.5 text-emerald-300"
                                    title="Resource unavailable"
                                  >
                                    {r.type === "FILE" ? (
                                      <Download className="h-4 w-4" />
                                    ) : (
                                      <ExternalLink className="h-4 w-4" />
                                    )}
                                  </span>
                                )}
                              </div>
                            </li>
                          );
                        })}
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
