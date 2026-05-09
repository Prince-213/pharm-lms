import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseChatBubble } from "@/components/student/course-chat-bubble";
import { CourseContentSidebar } from "@/components/student/course-content-sidebar";
import { CourseSessionShell } from "@/components/student/course-session-shell";
import { CourseCompletionCta } from "@/components/student/course-completion-cta";
import { LessonProgressToggle } from "@/components/student/lesson-progress-toggle";
import { SectionQuizLauncher } from "@/components/student/section-quiz-launcher";
import { CourseStatus, UserRole, EnrollmentStatus } from "@/generated/prisma/enums";
import { COURSE_ANNOUNCEMENTS_THREAD_TITLE } from "@/lib/course-discussions";
import { ProgressProvider } from "@/lib/student/progress-context";
import { recordCourseVisit } from "@/lib/courses/record-course-visit";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

function flattenLessons(
  sections: {
    id: string;
    title: string;
    lessons: {
      id: string;
      title: string;
      videoUrl: string | null;
      content: string | null;
      durationSec: number | null;
    }[];
  }[],
) {
  const out: Array<
    (typeof sections)[0]["lessons"][0] & {
      sectionId: string;
      sectionTitle: string;
    }
  > = [];
  for (const s of sections) {
    for (const l of s.lessons) {
      out.push({
        ...l,
        sectionId: s.id,
        sectionTitle: s.title,
      });
    }
  }
  return out;
}

export default async function StudentCourseLearningPage({
  params,
  searchParams,
}: {
  params: Promise<{ courseId: string }>;
  searchParams: Promise<{ lesson?: string; tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect("/student/login");
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect(roleHomePath(session.user.role));
  }

  const { courseId } = await params;
  const { lesson: lessonParam, tab: tabParam } = await searchParams;
  const tab = tabParam === "announcements" ? "announcements" : "overview";

  const [course, enrollment] = await Promise.all([
    db.course.findFirst({
      where: { id: courseId, status: CourseStatus.PUBLISHED },
      select: {
        id: true,
        title: true,
        congratulatoryTitle: true,
        congratulatoryContentType: true,
        congratulatoryArticle: true,
        congratulatoryVideoUrl: true,
        mentor: { select: { fullName: true } },
        sections: {
          orderBy: { position: "asc" },
          select: {
            id: true,
            title: true,
            description: true,
            lessons: {
              orderBy: { position: "asc" },
              select: {
                id: true,
                title: true,
                videoUrl: true,
                durationSec: true,
              },
            },
            quizzes: {
              orderBy: { createdAt: "desc" },
              select: { id: true, title: true, questions: true },
            },
          },
        },
      },
    }),
    db.enrollment.findUnique({
      where: {
        courseId_studentId: { courseId, studentId: session.user.id },
      },
    }),
  ]);
  if (!course) notFound();
  if (!enrollment) redirect(`/student/browse/${courseId}`);

  // Must never break the course player if it fails (function swallows errors),
  // but it does write to DB so keep it after auth/enrollment checks.
  await recordCourseVisit(session.user.id, course.id);

  const flat = flattenLessons(
    course.sections.map((s) => ({
      id: s.id,
      title: s.title,
      lessons: s.lessons.map((l) => ({
        id: l.id,
        title: l.title,
        videoUrl: l.videoUrl,
        content: null,
        durationSec: l.durationSec,
      })),
    })),
  );
  const selectedId =
    lessonParam && flat.some((x) => x.id === lessonParam)
      ? lessonParam
      : (flat[0]?.id ?? null);
  const selectedShell = flat.find((x) => x.id === selectedId) ?? null;
  const selected =
    selectedShell && tab === "overview"
      ? await db.lesson.findUnique({
          where: { id: selectedShell.id },
          select: {
            id: true,
            title: true,
            videoUrl: true,
            content: true,
            durationSec: true,
            sectionId: true,
          },
        }).then((row) => row ?? selectedShell)
      : selectedShell;
  const selectedSection = selected
    ? (course.sections.find((s) => s.id === selected.sectionId) ?? null)
    : null;
  const idx = selected ? flat.findIndex((x) => x.id === selected.id) : -1;
  const prevLesson = idx > 0 ? flat[idx - 1] : null;
  const nextLesson = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const [progressRows, announcementsThread] = await Promise.all([
    db.lessonProgress.findMany({
      where: {
        studentId: session.user.id,
        lesson: { section: { courseId } },
      },
      select: { lessonId: true, completed: true },
    }),
    tab === "announcements"
      ? db.forumThread.findFirst({
          where: { courseId, title: COURSE_ANNOUNCEMENTS_THREAD_TITLE },
          include: {
            posts: {
              orderBy: { createdAt: "desc" },
              include: { author: { select: { fullName: true, role: true } } },
            },
          },
        })
      : Promise.resolve(null),
  ]);
  const progressMap: Record<string, boolean> = {};
  for (const p of progressRows) {
    if (p.completed) progressMap[p.lessonId] = true;
  }

  const completedCount = flat.filter((l) => progressMap[l.id]).length;
  const completedSectionCount = new Set(
    flat.filter((l) => progressMap[l.id]).map((l) => l.sectionId),
  ).size;
  const totalLessons = flat.length;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const videoSrc = selected?.videoUrl
    ? selected.videoUrl.startsWith("r2://")
      ? `/api/student/lessons/${selected.id}/stream`
      : selected.videoUrl
    : null;

  const base = `/student/course/${courseId}`;
  const qs = (lessonId: string | null, t: string) => {
    const p = new URLSearchParams();
    if (lessonId) p.set("lesson", lessonId);
    if (t !== "overview") p.set("tab", t);
    const s = p.toString();
    return s ? `${base}?${s}` : base;
  };

  const lessonLine = selected
    ? `${selected.title} · ${course.mentor.fullName}`
    : `With ${course.mentor.fullName}`;

  const mintBadge =
    progressPct >= 100
      ? "Complete"
      : totalLessons === 0
        ? "No lessons"
        : "Clinical mint status";

  const floatingNav =
    prevLesson || nextLesson ? (
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3 sm:bottom-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-xl border border-white/20 bg-[rgba(255,255,255,0.88)] px-2 py-2 shadow-[0px_32px_64px_0px_rgba(0,0,0,0.18)] backdrop-blur-md sm:gap-3 sm:px-4">
          {prevLesson ? (
            <Link
              href={qs(prevLesson.id, tab)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6e8e9] text-[var(--ink-deep)] transition hover:bg-slate-300/90 sm:h-12 sm:w-12"
              aria-label="Previous lesson"
            >
              <ChevronLeft className="h-5 w-5" />
            </Link>
          ) : (
            <span className="h-11 w-11 sm:h-12 sm:w-12" />
          )}
          {nextLesson ? (
            <Link
              href={qs(nextLesson.id, tab)}
              className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#e6e8e9] text-[var(--ink-deep)] transition hover:bg-slate-300/90 sm:h-12 sm:w-12"
              aria-label="Next lesson"
            >
              <ChevronRight className="h-5 w-5" />
            </Link>
          ) : (
            <span className="h-11 w-11 sm:h-12 sm:w-12" />
          )}
        </div>
      </div>
    ) : null;

  const stage = !selected ? (
    <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-emerald-100/75">
      This course has no lessons yet.
    </div>
  ) : (
    <div className="relative flex min-h-[min(52vh,560px)] flex-1 flex-col p-4 sm:min-h-[min(56vh,640px)] sm:p-6">
      <div className="relative mx-auto w-full max-w-5xl flex-1">
        <div className="overflow-hidden rounded-lg bg-[var(--ink-mid)] shadow-[var(--shadow-lg)] ring-1 ring-white/10">
          {videoSrc ? (
            <video
              key={selected.id}
              controls
              className="aspect-video max-h-[min(68vh,720px)] w-full bg-black"
              src={videoSrc}
              preload="metadata"
            />
          ) : (
            <div className="flex aspect-video max-h-[min(68vh,720px)] items-center justify-center bg-[var(--ink-mid)] px-6 text-center text-sm text-slate-300">
              Article lesson — use Overview below for text.
            </div>
          )}
        </div>
        {floatingNav}
      </div>
    </div>
  );

  const lessonPanel = !selected ? null : (
    <>
      <div className="border-b border-[var(--border-subtle)] bg-[var(--surface-muted)]/60 px-4 sm:px-6">
        <div className="mx-auto max-w-5xl py-4 border-b border-[var(--border-subtle)]/50">
          <CourseCompletionCta 
            courseId={courseId}
            canComplete={progressPct >= 100 || (totalLessons === 0 && course.sections.length > 0)}
            alreadyCompleted={enrollment.status === EnrollmentStatus.COMPLETED}
            congratulatoryTitle={course.congratulatoryTitle}
            congratulatoryContentType={course.congratulatoryContentType}
            congratulatoryArticle={course.congratulatoryArticle}
            congratulatoryVideoUrl={course.congratulatoryVideoUrl}
          />
        </div>
        <div className="mx-auto flex max-w-5xl gap-1 pt-2">
          <Link
            href={qs(selected.id, "overview")}
            className={
              tab === "overview"
                ? "rounded-t-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] sm:text-sm"
                : "rounded-t-md px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-black/5 sm:text-sm"
            }
          >
            Case notes
          </Link>
          <Link
            href={qs(selected.id, "announcements")}
            className={
              tab === "announcements"
                ? "rounded-t-md bg-[var(--primary)] px-4 py-2 text-xs font-semibold text-[var(--primary-foreground)] sm:text-sm"
                : "rounded-t-md px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-black/5 sm:text-sm"
            }
          >
            Announcements
          </Link>
          <Link
            href={`/student/course/${courseId}/forum`}
            className="rounded-t-md px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-black/5 sm:text-sm"
          >
            Forum
          </Link>
          <Link
            href={`/student/course/${courseId}/ai-quiz`}
            className="rounded-t-md px-4 py-2 text-xs font-semibold text-[var(--muted)] hover:bg-black/5 sm:text-sm"
          >
            AI quiz
          </Link>
        </div>
      </div>
      <div className="px-4 py-6 sm:px-8">
        <div className="mx-auto max-w-5xl">
          {tab === "overview" ? (
            <div className="space-y-4">
              <h2 className="font-display text-lg font-bold text-[var(--foreground)]">
                {selected.title}
              </h2>
              {selected.content ? (
                <div
                  className="max-w-none text-sm leading-relaxed text-[var(--foreground)] [&_a]:text-[var(--primary)] [&_p]:mb-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  This video lesson does not include a separate article. Mark
                  complete when you have finished watching.
                </p>
              )}
              <div className="flex flex-wrap gap-4 border-t border-[var(--border-subtle)] pt-4">
                <LessonProgressToggle
                  courseId={courseId}
                  lessonId={selected.id}
                  initialCompleted={progressMap[selected.id] ?? false}
                />
                {selectedSection?.quizzes?.length ? (
                  <SectionQuizLauncher quizzes={selectedSection.quizzes} />
                ) : null}
                <Link
                  href={`/student/course/${courseId}/ai-quiz`}
                  className="inline-flex h-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--primary)] px-4 text-sm font-semibold text-[var(--primary-foreground)] transition hover:bg-[var(--primary-strong)]"
                >
                  Generate smart quiz
                </Link>
              </div>
            </div>
          ) : announcementsThread?.posts.length ? (
            <div className="space-y-3">
              {announcementsThread.posts.slice(0, 12).map((post) => (
                <article
                  key={post.id}
                  className="rounded-lg border border-[var(--border)] bg-[var(--background)] p-4"
                >
                  <div className="mb-1 flex items-center justify-between gap-3">
                    <p className="text-xs font-semibold text-[var(--foreground)]">
                      {post.author.fullName} · {post.author.role}
                    </p>
                    <p className="text-[11px] text-[var(--muted)]">
                      {post.createdAt.toLocaleString()}
                    </p>
                  </div>
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-[var(--foreground)]">
                    {post.body}
                  </p>
                </article>
              ))}
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-[var(--border)] bg-[var(--surface-muted)]/60 p-8 text-center text-sm text-[var(--muted)]">
              No announcements yet. Your mentor updates this area from the
              mentor course overview.
            </div>
          )}
        </div>
      </div>
    </>
  );

  return (
    <ProgressProvider courseId={courseId} initialProgress={{ ...progressMap }}>
      <CourseSessionShell
        courseTitle={course.title}
        lessonLine={lessonLine}
        progressPct={progressPct}
        totalLessons={totalLessons}
        courseId={courseId}
        childrenStage={stage}
        childrenLessonPanel={lessonPanel}
        childrenSidebar={
          <CourseContentSidebar
            courseId={courseId}
            intelHeading="Session intelligence"
            intelBadge={mintBadge}
            sections={course.sections.map((s) => ({
              id: s.id,
              title: s.title,
              description: s.description,
              lessons: s.lessons.map((l) => ({
                id: l.id,
                title: l.title,
                videoUrl: l.videoUrl,
                content: null,
                durationSec: l.durationSec,
              })),
            }))}
            selectedLessonId={selectedId}
            progressMap={progressMap}
          />
        }
      />
      <CourseChatBubble
        courseId={courseId}
        disabled={completedSectionCount === 0}
      />
    </ProgressProvider>
  );
}
