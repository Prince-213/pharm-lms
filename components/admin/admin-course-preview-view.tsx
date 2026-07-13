"use client";

import { clsx } from "clsx";
import {
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  LayoutGrid,
  Library,
  Link2,
  MessageSquareText,
  PanelTop,
  Play,
} from "lucide-react";
import { useMemo, useState } from "react";
import type { SectionResource } from "@/components/mentor/curriculum-editor-v2";
import { AdminCourseStatusBadge } from "@/components/admin/admin-course-status-badge";
import { AdminPanel } from "@/components/admin/admin-panel";
import type { CourseStatus } from "@/generated/prisma/enums";
import { formatResourceMetaLine, resourceDownloadFilename } from "@/lib/section-resource-meta";

export type AdminPreviewSectionResource = SectionResource & { resolvedHref: string | null };

export type AdminPreviewLesson = {
  id: string;
  title: string;
  content: string | null;
  videoUrl: string | null;
  videoResolvedHref: string | null;
};

export type AdminPreviewSection = {
  id: string;
  title: string;
  descriptionText: string;
  resources: AdminPreviewSectionResource[];
  lessons: AdminPreviewLesson[];
};

export type AdminCoursePreviewPayload = {
  courseId: string;
  title: string;
  subtitle: string | null;
  status: CourseStatus;
  rejectionReason: string | null;
  formattedPrice: string;
  description: string;
  welcomeMessage: string | null;
  congratulatoryTitle: string | null;
  congratulatoryContentType: string | null;
  congratulatoryMessage: string | null;
  congratulatoryArticle: string | null;
  congratulatoryVideoUrl: string | null;
  category: string | null;
  subcategory: string | null;
  level: string | null;
  language: string | null;
  primaryTopic: string | null;
  mentor: { fullName: string; email: string | null };
  sectionCount: number;
  lessonCount: number;
  enrollmentCount: number;
  sections: AdminPreviewSection[];
  announcements: Array<{ id: string; body: string; createdAtIso: string }>;
  forumPosts: Array<{
    id: string;
    body: string;
    createdAtIso: string;
    authorName: string;
    authorRole: string;
  }>;
};

type TabId = "overview" | "curriculum" | "catalog" | "discussions";

const TABS: { id: TabId; label: string; icon: typeof LayoutGrid }[] = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "curriculum", label: "Curriculum", icon: Library },
  { id: "catalog", label: "Catalog copy", icon: PanelTop },
  { id: "discussions", label: "Discussions", icon: MessageSquareText },
];

function TabButton({
  tab,
  active,
  onSelect,
}: {
  tab: (typeof TABS)[number];
  active: boolean;
  onSelect: () => void;
}) {
  const Icon = tab.icon;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={onSelect}
      className={clsx(
        "flex min-h-[44px] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold transition-colors sm:flex-none sm:px-4",
        active
          ? "bg-[var(--background)] text-[var(--foreground)] shadow-sm ring-1 ring-[var(--border)]"
          : "text-muted-foreground hover:bg-[var(--background)] hover:text-[var(--foreground)]",
      )}
    >
      <Icon className="h-4 w-4 shrink-0 opacity-80" strokeWidth={1.75} />
      <span className="hidden sm:inline">{tab.label}</span>
      <span className="sm:hidden">{tab.label.split(" ")[0]}</span>
    </button>
  );
}

function StatTile({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3 text-center">
      <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight text-[var(--foreground)]">{value}</p>
    </div>
  );
}

function MetaChip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-[var(--border)] bg-[var(--background)] px-2.5 py-0.5 text-xs font-medium text-[var(--foreground)]">
      {children}
    </span>
  );
}

function effectiveResourceHref(r: AdminPreviewSectionResource): string | null {
  if (r.resolvedHref) return r.resolvedHref;
  const u = r.url?.trim();
  if (u?.startsWith("https://") || u?.startsWith("http://") || u?.startsWith("/")) return u;
  return null;
}

function youtubeEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname === "youtu.be") {
      const id = u.pathname.replace(/^\//, "").split("/")[0];
      if (id) return `https://www.youtube.com/embed/${id}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/embed/${v}`;
      const embed = u.pathname.match(/\/embed\/([^/?]+)/);
      if (embed) return `https://www.youtube.com/embed/${embed[1]}`;
      const shorts = u.pathname.match(/^\/shorts\/([^/?]+)/);
      if (shorts) return `https://www.youtube.com/embed/${shorts[1]}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function vimeoEmbedSrc(url: string): string | null {
  try {
    const u = new URL(url);
    if (u.hostname.includes("vimeo.com")) {
      const m = u.pathname.match(/\/(?:video\/)?(\d+)/);
      if (m) return `https://player.vimeo.com/video/${m[1]}`;
    }
  } catch {
    /* ignore */
  }
  return null;
}

function videoEmbedSrcFromUrl(url: string | null | undefined): string | null {
  if (!url?.trim()) return null;
  return youtubeEmbedSrc(url) || vimeoEmbedSrc(url) || null;
}

function lessonVideoPlayableUrl(lesson: AdminPreviewLesson): string | null {
  const u = lesson.videoResolvedHref?.trim() || lesson.videoUrl?.trim();
  return u || null;
}

function SectionResourcesList({ resources }: { resources: AdminPreviewSectionResource[] }) {
  if (resources.length === 0) return null;
  return (
    <div className="my-4 rounded-xl border border-primary/20 bg-primary/10 px-3 py-3 dark:border-primary/30 dark:bg-primary/20">
      <p className="mb-2 text-[10px] font-bold uppercase tracking-wider text-primary dark:text-primary-foreground/90">
        Section resources
      </p>
      <ul className="space-y-2">
        {resources.map((r) => {
          const href = effectiveResourceHref(r);
          const res = r as SectionResource;
          return (
            <li key={r.id}>
              <div className="flex items-start gap-2 rounded-lg px-1 py-1">
                <div className="mt-0.5 shrink-0 text-primary dark:text-primary/80">
                  {r.type === "LINK" ? (
                    <Link2 className="h-4 w-4" strokeWidth={2} />
                  ) : (
                    <FileText className="h-4 w-4" strokeWidth={2} />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-primary dark:text-primary-foreground">
                    {r.title}
                  </p>
                  <p className="mt-0.5 line-clamp-2 text-xs leading-snug text-primary/80 dark:text-primary-foreground/90/80">
                    {formatResourceMetaLine(res)}
                  </p>
                </div>
                <div className="flex shrink-0 gap-1">
                  {href && r.type === "LINK" ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-md p-2 text-primary transition-colors hover:bg-primary/15 dark:text-primary-foreground/80 dark:hover:bg-primary/25"
                      title="Open link"
                      aria-label={`Open ${r.title}`}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  ) : null}
                  {href && r.type === "FILE" ? (
                    <a
                      href={href}
                      download={resourceDownloadFilename(res)}
                      className="rounded-md p-2 text-primary transition-colors hover:bg-primary/15 dark:text-primary-foreground/80 dark:hover:bg-primary/25"
                      title="Download"
                      aria-label={`Download ${r.title}`}
                    >
                      <Download className="h-4 w-4" />
                    </a>
                  ) : null}
                  {!href ? (
                    <span className="max-w-[140px] px-1 text-[10px] leading-tight text-primary/70 dark:text-primary-foreground/90/70">
                      {r.type === "FILE" && r.url?.startsWith("r2://")
                        ? "Signed URL unavailable (check storage config)."
                        : "No playable URL."}
                    </span>
                  ) : null}
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function AdminCoursePreviewView({ data }: { data: AdminCoursePreviewPayload }) {
  const [tab, setTab] = useState<TabId>("overview");
  const [openSections, setOpenSections] = useState<Record<string, boolean>>(() => {
    const first = data.sections[0]?.id;
    return first ? { [first]: true } : {};
  });
  const [openLessons, setOpenLessons] = useState<Record<string, boolean>>({});
  const [openLessonVideo, setOpenLessonVideo] = useState<Record<string, boolean>>({});

  const metaChips = useMemo(
    () =>
      [data.category, data.subcategory, data.level, data.language, data.primaryTopic].filter(
        (x): x is string => Boolean(x?.trim()),
      ),
    [data],
  );

  function toggleSection(id: string) {
    setOpenSections((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  function toggleLesson(id: string) {
    setOpenLessons((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="space-y-6">
      <div
        className="sticky top-0 z-20 -mx-1 border-b border-[var(--border)] bg-[var(--surface)]/95 px-1 pb-3 pt-1 backdrop-blur-sm md:top-[var(--admin-offset,0)]"
        role="tablist"
        aria-label="Preview sections"
      >
        <div className="flex flex-wrap gap-1 sm:flex-nowrap sm:gap-2">
          {TABS.map((t) => (
            <TabButton key={t.id} tab={t} active={tab === t.id} onSelect={() => setTab(t.id)} />
          ))}
        </div>
      </div>

      <div className="min-h-[320px]" role="tabpanel">
        {tab === "overview" ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            {data.rejectionReason ? (
              <div
                className="rounded-xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/40 dark:bg-rose-950/30 dark:text-rose-100"
                role="status"
              >
                <p className="text-xs font-semibold uppercase tracking-wide text-rose-800 dark:text-rose-200">
                  Rejection feedback
                </p>
                <p className="mt-1 leading-relaxed">{data.rejectionReason}</p>
              </div>
            ) : null}

            <AdminPanel title={data.title} description={data.subtitle?.trim() ? data.subtitle : undefined}>
              <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
                <div className="min-w-0 space-y-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AdminCourseStatusBadge status={data.status} />
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tutor</p>
                    <p className="mt-1 text-sm font-medium text-[var(--foreground)]">{data.mentor.fullName}</p>
                    {data.mentor.email ? (
                      <a
                        href={`mailto:${encodeURIComponent(data.mentor.email)}`}
                        className="mt-0.5 block text-sm text-[var(--primary-strong)] hover:underline"
                      >
                        {data.mentor.email}
                      </a>
                    ) : null}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Price</p>
                    <p className="mt-1 text-lg font-semibold tabular-nums text-[var(--foreground)]">
                      {data.formattedPrice}
                    </p>
                  </div>
                  {metaChips.length ? (
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Catalog meta</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {metaChips.map((m) => (
                          <MetaChip key={m}>{m}</MetaChip>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </div>
                <div className="grid w-full max-w-md grid-cols-3 gap-3 sm:min-w-[300px]">
                  <StatTile label="Sections" value={data.sectionCount} />
                  <StatTile label="Lessons" value={data.lessonCount} />
                  <StatTile label="Enrollments" value={data.enrollmentCount} />
                </div>
              </div>
            </AdminPanel>
          </div>
        ) : null}

        {tab === "curriculum" ? (
          <AdminPanel
            title="Curriculum"
            description="Sections and lessons — expand to inspect lesson HTML and media references."
            className="animate-in fade-in duration-200"
          >
            {data.sections.length === 0 ? (
              <p className="text-sm text-muted-foreground">No sections yet.</p>
            ) : (
              <ul className="space-y-2">
                {data.sections.map((section, sIdx) => {
                  const open = Boolean(openSections[section.id]);
                  return (
                    <li
                      key={section.id}
                      className="overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--background)]"
                    >
                      <button
                        type="button"
                        onClick={() => toggleSection(section.id)}
                        aria-expanded={open}
                        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[var(--surface)]"
                      >
                        <ChevronRight
                          className={clsx(
                            "h-4 w-4 shrink-0 text-muted-foreground transition-transform",
                            open && "rotate-90",
                          )}
                          strokeWidth={2}
                        />
                        <span className="min-w-0 flex-1">
                          <span className="text-xs font-medium text-muted-foreground">Section {sIdx + 1}</span>
                          <span className="mt-0.5 block font-semibold text-[var(--foreground)]">{section.title}</span>
                        </span>
                        <span className="shrink-0 rounded-full bg-[var(--surface)] px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-[var(--border)]">
                          {section.lessons.length} lessons
                        </span>
                      </button>
                      {open ? (
                        <div className="border-t border-[var(--border)] px-4 pb-4 pt-1">
                          {section.descriptionText?.trim() ? (
                            <p className="py-2 text-sm leading-relaxed text-[var(--foreground)]">
                              {section.descriptionText}
                            </p>
                          ) : null}
                          <SectionResourcesList resources={section.resources} />
                          <ul className="divide-y divide-[var(--border)] rounded-lg border border-[var(--border)] bg-[var(--surface)]">
                            {section.lessons.map((lesson, lIdx) => {
                              const lOpen = Boolean(openLessons[lesson.id]);
                              const hasBody = Boolean(lesson.content?.trim());
                              const playable = lessonVideoPlayableUrl(lesson);
                              const embedSrc = videoEmbedSrcFromUrl(playable);
                              const videoOpen = Boolean(openLessonVideo[lesson.id]);
                              const linkHref = lesson.videoResolvedHref ?? playable;
                              return (
                                <li key={lesson.id} className="px-3 py-3">
                                  <div className="flex flex-wrap items-baseline gap-2">
                                    <span className="text-xs tabular-nums text-muted-foreground">
                                      {sIdx + 1}.{lIdx + 1}
                                    </span>
                                    <span className="font-medium text-[var(--foreground)]">{lesson.title}</span>
                                  </div>
                                  {playable ? (
                                    <div className="mt-2 space-y-2">
                                      <div className="flex flex-wrap items-center gap-2">
                                        {embedSrc ? (
                                          <button
                                            type="button"
                                            onClick={() =>
                                              setOpenLessonVideo((prev) => ({
                                                ...prev,
                                                [lesson.id]: !prev[lesson.id],
                                              }))
                                            }
                                            className="inline-flex items-center gap-1.5 rounded-md border border-[var(--border)] bg-[var(--background)] px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--surface)]"
                                          >
                                            <Play className="h-3.5 w-3.5" />
                                            {videoOpen ? "Hide preview" : "Preview video"}
                                          </button>
                                        ) : null}
                                        {linkHref ? (
                                          <a
                                            href={linkHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--primary-strong)] hover:underline"
                                          >
                                            <ExternalLink className="h-3.5 w-3.5" />
                                            Open video
                                          </a>
                                        ) : null}
                                      </div>
                                      {embedSrc && videoOpen ? (
                                        <div className="aspect-video w-full max-w-2xl overflow-hidden rounded-lg border border-[var(--border)] bg-black/5">
                                          <iframe
                                            title={`Video: ${lesson.title}`}
                                            src={embedSrc}
                                            className="h-full w-full"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                            allowFullScreen
                                          />
                                        </div>
                                      ) : null}
                                      {lesson.videoUrl?.startsWith("r2://") ? (
                                        <p className="break-all font-mono text-[10px] text-muted-foreground">
                                          {lesson.videoUrl}
                                        </p>
                                      ) : null}
                                    </div>
                                  ) : null}
                                  {hasBody ? (
                                    <div className="mt-2">
                                      <button
                                        type="button"
                                        onClick={() => toggleLesson(lesson.id)}
                                        className="text-xs font-semibold text-[var(--primary-strong)] hover:underline"
                                      >
                                        {lOpen ? "Hide lesson body" : "Show lesson body"}
                                      </button>
                                      {lOpen ? (
                                        <div className="mt-2 max-h-[min(50vh,360px)] overflow-y-auto rounded-lg border border-[var(--border)] bg-[var(--background)] p-3">
                                          <div
                                            className="prose prose-sm max-w-none text-[var(--foreground)] [&_*]:max-w-none"
                                            dangerouslySetInnerHTML={{ __html: lesson.content ?? "" }}
                                          />
                                        </div>
                                      ) : null}
                                    </div>
                                  ) : (
                                    <p className="mt-1 text-xs text-muted-foreground">No lesson body.</p>
                                  )}
                                </li>
                              );
                            })}
                          </ul>
                        </div>
                      ) : null}
                    </li>
                  );
                })}
              </ul>
            )}
          </AdminPanel>
        ) : null}

        {tab === "catalog" ? (
          <div className="space-y-6 animate-in fade-in duration-200">
            <AdminPanel title="Marketing description" description="Rendered HTML as learners would see in catalog context.">
              {data.description?.trim() ? (
                <div
                  className="prose prose-sm max-w-none rounded-xl border border-[var(--border)] bg-[var(--background)] p-5 text-[var(--foreground)] [&_*]:max-w-none"
                  dangerouslySetInnerHTML={{ __html: data.description }}
                />
              ) : (
                <p className="text-sm text-muted-foreground">No description.</p>
              )}
            </AdminPanel>

            <AdminPanel title="Welcome message" description="Shown to learners when appropriate in the product flow.">
              {data.welcomeMessage?.trim() ? (
                <pre className="max-h-[min(50vh,400px)] overflow-y-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-relaxed text-[var(--foreground)]">
                  {data.welcomeMessage}
                </pre>
              ) : (
                <p className="text-sm text-muted-foreground">No welcome message.</p>
              )}
            </AdminPanel>

            <AdminPanel title="Completion & congratulatory" description="End-of-course messaging configuration.">
              <dl className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Title</dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">{data.congratulatoryTitle ?? "—"}</dd>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Content type</dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">{data.congratulatoryContentType ?? "—"}</dd>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Legacy message</dt>
                  <dd className="mt-1 text-sm text-[var(--foreground)]">{data.congratulatoryMessage ?? "—"}</dd>
                </div>
                <div className="rounded-lg border border-[var(--border)] bg-[var(--background)] px-4 py-3 sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Video URL</dt>
                  <dd className="mt-1 break-all font-mono text-sm text-[var(--foreground)]">
                    {data.congratulatoryVideoUrl ? (
                      <a
                        href={data.congratulatoryVideoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[var(--primary-strong)] hover:underline"
                      >
                        {data.congratulatoryVideoUrl}
                      </a>
                    ) : (
                      "—"
                    )}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Article body</p>
                {data.congratulatoryArticle?.trim() ? (
                  <pre className="mt-2 max-h-[min(50vh,400px)] overflow-y-auto whitespace-pre-wrap rounded-xl border border-[var(--border)] bg-[var(--background)] p-4 font-sans text-sm leading-relaxed text-[var(--foreground)]">
                    {data.congratulatoryArticle}
                  </pre>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">No article body.</p>
                )}
              </div>
            </AdminPanel>
          </div>
        ) : null}

        {tab === "discussions" ? (
          <div className="grid gap-6 lg:grid-cols-2 animate-in fade-in duration-200">
            <AdminPanel title="Announcements" description="Posts in the course announcements thread.">
              {data.announcements.length === 0 ? (
                <p className="text-sm text-muted-foreground">No announcements yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.announcements.map((post) => (
                    <li
                      key={post.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <p className="text-sm leading-relaxed text-[var(--foreground)]">{post.body}</p>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {new Date(post.createdAtIso).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
            <AdminPanel title="General forum" description="Discussion thread — author and role shown per post.">
              {data.forumPosts.length === 0 ? (
                <p className="text-sm text-muted-foreground">No forum posts yet.</p>
              ) : (
                <ul className="space-y-3">
                  {data.forumPosts.map((post) => (
                    <li
                      key={post.id}
                      className="rounded-xl border border-[var(--border)] bg-[var(--background)] px-4 py-3"
                    >
                      <p className="text-xs font-semibold text-[var(--foreground)]">
                        {post.authorName}
                        <span className="font-normal text-muted-foreground"> · {post.authorRole}</span>
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-[var(--foreground)]">{post.body}</p>
                      <p className="mt-2 text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
                        {new Date(post.createdAtIso).toLocaleString()}
                      </p>
                    </li>
                  ))}
                </ul>
              )}
            </AdminPanel>
          </div>
        ) : null}
      </div>
    </div>
  );
}
