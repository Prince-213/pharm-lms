import { ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseForumExperience } from "@/components/course-forum/course-forum-experience";
import { AiQuizWorkspace } from "@/components/student/ai-quiz-workspace";
import { CourseChatBubble } from "@/components/student/course-chat-bubble";
import { CourseCompletionCta } from "@/components/student/course-completion-cta";
import { CourseContentSidebar } from "@/components/student/course-content-sidebar";
import { CourseCurriculumSearchTrigger } from "@/components/student/course-curriculum-search-trigger";
import { CourseLessonQuickActions } from "@/components/student/course-lesson-quick-actions";
import { CourseNotesTab } from "@/components/student/course-notes-tab";
import { CourseReviewsTab } from "@/components/student/course-reviews-tab";
import { CourseSessionShell } from "@/components/student/course-session-shell";
import {
  CourseStatus,
  EnrollmentStatus,
  UserRole,
} from "@/generated/prisma/enums";
import type { CatalogResourceItem } from "@/lib/course-catalog-detail";
import { COURSE_ANNOUNCEMENTS_THREAD_TITLE } from "@/lib/course-discussions";
import { getCourseForumData } from "@/lib/course-forum/get-course-forum-data";
import { studentHasCompletedAtLeastOneFullSection } from "@/lib/course-review-eligibility";
import { recordCourseVisit } from "@/lib/courses/record-course-visit";
import { parseSectionDescription } from "@/lib/curriculum";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { ProgressProvider } from "@/lib/student/progress-context";
import { cn } from "@/lib/utils";

const COURSE_PLAYER_TABS = [
  "overview",
  "notes",
  "announcements",
  "forum",
  "ai-quiz",
  "reviews",
] as const;

type CoursePlayerTab = (typeof COURSE_PLAYER_TABS)[number];

function parseCoursePlayerTab(raw: string | undefined): CoursePlayerTab {
  if (raw && (COURSE_PLAYER_TABS as readonly string[]).includes(raw)) {
    return raw as CoursePlayerTab;
  }
  return "overview";
}

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
  const tab = parseCoursePlayerTab(tabParam);

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

  const congratulatoryVideoSrc = await resolveMediaUrl(
    course.congratulatoryVideoUrl,
  );

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
      ? await db.lesson
          .findUnique({
            where: { id: selectedShell.id },
            select: {
              id: true,
              title: true,
              videoUrl: true,
              content: true,
              durationSec: true,
              sectionId: true,
            },
          })
          .then((row) => row ?? selectedShell)
      : selectedShell;
  const selectedSection = selected
    ? (course.sections.find((s) => s.id === selected.sectionId) ?? null)
    : null;
  const idx = selected ? flat.findIndex((x) => x.id === selected.id) : -1;
  const prevLesson = idx > 0 ? flat[idx - 1] : null;
  const nextLesson = idx >= 0 && idx < flat.length - 1 ? flat[idx + 1] : null;

  const [
    progressRows,
    announcementsThread,
    forumData,
    reviewData,
    lessonNotesRows,
    aiQuizProgressRows,
    hasFullSectionComplete,
  ] = await Promise.all([
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
    tab === "forum" ? getCourseForumData(courseId) : Promise.resolve(null),
    tab === "reviews"
      ? Promise.all([
          db.courseReview.aggregate({
            where: { courseId },
            _avg: { rating: true },
            _count: true,
          }),
          db.courseReview.groupBy({
            by: ["rating"],
            where: { courseId },
            _count: { rating: true },
          }),
          db.courseReview.findMany({
            where: { courseId },
            orderBy: { createdAt: "desc" },
            take: 50,
            select: {
              id: true,
              rating: true,
              comment: true,
              createdAt: true,
              student: { select: { fullName: true } },
            },
          }),
          db.courseReview.findUnique({
            where: {
              courseId_studentId: { courseId, studentId: session.user.id },
            },
            select: { rating: true, comment: true },
          }),
        ])
      : Promise.resolve(null),
    tab === "notes" && selectedId
      ? db.studentLessonNote.findMany({
          where: { studentId: session.user.id, lessonId: selectedId },
          orderBy: { createdAt: "desc" },
          select: { id: true, body: true, createdAt: true, updatedAt: true },
        })
      : Promise.resolve([]),
    tab === "ai-quiz"
      ? db.lessonProgress.findMany({
          where: {
            studentId: session.user.id,
            completed: true,
            lesson: { section: { courseId } },
          },
          select: { lesson: { select: { sectionId: true } } },
        })
      : Promise.resolve([]),
    studentHasCompletedAtLeastOneFullSection(session.user.id, courseId),
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

  const enrollmentAllowsReview =
    enrollment.status === EnrollmentStatus.ACTIVE ||
    enrollment.status === EnrollmentStatus.COMPLETED;
  const canLeaveReview = enrollmentAllowsReview && hasFullSectionComplete;
  const existingReview = reviewData?.[3] ?? null;

  const reviewAgg = reviewData?.[0];
  const reviewGrouped = reviewData?.[1] ?? [];
  const reviewList = reviewData?.[2] ?? [];
  const reviewCount = reviewAgg?._count ?? 0;
  const ratingAverage =
    reviewCount > 0 && reviewAgg?._avg.rating != null
      ? Math.round(reviewAgg._avg.rating * 10) / 10
      : null;
  const countByStar = new Map(
    reviewGrouped.map((g) => [g.rating, g._count.rating]),
  );
  const ratingDistribution = [5, 4, 3, 2, 1].map((rating) => ({
    rating,
    count: countByStar.get(rating) ?? 0,
  }));

  const completedSectionIdsForAi = [
    ...new Set(aiQuizProgressRows.map((p) => p.lesson.sectionId)),
  ];

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

  const sidebarSections = await Promise.all(
    course.sections.map(async (s) => {
      const raw = parseSectionDescription(s.description).resources;
      const resources: CatalogResourceItem[] = await Promise.all(
        raw.map(async (r) => ({
          ...r,
          href: await resolveMediaUrl(r.url),
        })),
      );
      return {
        id: s.id,
        title: s.title,
        description: s.description,
        resources,
        lessons: s.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          videoUrl: l.videoUrl,
          content: null,
          durationSec: l.durationSec,
        })),
      };
    }),
  );

  const mintBadge =
    progressPct >= 100
      ? "Complete"
      : totalLessons === 0
        ? "No lessons"
        : "In progress";

  const floatingNav =
    prevLesson || nextLesson ? (
      <div className="pointer-events-none absolute inset-x-0 bottom-4 flex justify-center px-3 sm:bottom-6">
        <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/25 bg-[rgba(255,255,255,0.92)] px-2 py-2 shadow-lg backdrop-blur-md sm:gap-3 sm:px-4">
          {prevLesson ? (
            <Link
              href={qs(prevLesson.id, tab)}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md transition hover:opacity-90 sm:h-12 sm:w-12"
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
              className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] shadow-md transition hover:opacity-90 sm:h-12 sm:w-12"
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
            // biome-ignore lint/a11y/useMediaCaption: Lesson videos use mentor-provided files; captions not modeled in schema yet.
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
      <div className="border-b border-[#ececec] bg-white px-4 sm:px-6">
        <div className="mx-auto max-w-5xl border-b border-[#f0f0f0] py-3 sm:py-4">
          <CourseCompletionCta
            courseId={courseId}
            canComplete={
              progressPct >= 100 ||
              (totalLessons === 0 && course.sections.length > 0)
            }
            alreadyCompleted={enrollment.status === EnrollmentStatus.COMPLETED}
            congratulatoryTitle={course.congratulatoryTitle}
            congratulatoryContentType={course.congratulatoryContentType}
            congratulatoryArticle={course.congratulatoryArticle}
            congratulatoryVideoUrl={congratulatoryVideoSrc ?? undefined}
          />
        </div>
        <div className="mx-auto max-w-5xl">
          <div className="flex flex-col gap-2  pb-0 sm:flex-row sm:items-end sm:justify-between sm:gap-3">
            <div className="flex min-w-0 flex-wrap items-end gap-x-0.5 gap-y-1">
              <CourseCurriculumSearchTrigger />
              {(
                [
                  ["overview", "Overview"],
                  ["notes", "Notes"],
                  ["announcements", "Announcements"],
                  ["forum", "Forums"],
                  ["ai-quiz", "AI Quiz"],
                  ["reviews", "Reviews"],
                ] as const
              ).map(([id, label]) => (
                <Link
                  key={id}
                  href={qs(selected.id, id)}
                  className={cn(
                    "relative px-2.5 py-3 text-xs font-semibold transition-colors sm:px-4 sm:text-sm",
                    tab === id
                      ? "text-[var(--foreground)] after:absolute after:bottom-0 after:left-1 after:right-1 after:h-[3px] after:rounded-t after:bg-[var(--primary)] sm:after:left-2 sm:after:right-2"
                      : "text-[var(--muted)] hover:text-[var(--foreground)]",
                  )}
                >
                  {label}
                </Link>
              ))}
            </div>
            <CourseLessonQuickActions
              key={selected.id}
              courseId={courseId}
              lessonId={selected.id}
              initialCompleted={progressMap[selected.id] ?? false}
              quizzes={selectedSection?.quizzes ?? []}
            />
          </div>
        </div>
      </div>
      <div className="bg-white px-4 py-6 sm:px-8">
        <div className="mx-auto min-h-[50vh] max-w-5xl">
          {tab === "overview" ? (
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-[var(--foreground)]">
                {selected.title}
              </h2>
              {selected.content ? (
                <div
                  className="max-w-none text-sm leading-relaxed text-[var(--foreground)] [&_a]:text-[var(--primary)] [&_p]:mb-3 [&_ul]:my-2 [&_ul]:list-disc [&_ul]:pl-5"
                  // biome-ignore lint/security/noDangerouslySetInnerHtml: Lesson HTML from mentor editor.
                  dangerouslySetInnerHTML={{ __html: selected.content }}
                />
              ) : (
                <p className="text-sm text-[var(--muted)]">
                  This video lesson does not include a separate article. Mark
                  complete when you have finished watching.
                </p>
              )}
            </div>
          ) : tab === "notes" && selectedId ? (
            <CourseNotesTab
              courseId={courseId}
              basePath={base}
              selectedLessonId={selectedId}
              lessons={flat.map((l) => ({
                id: l.id,
                title: l.title,
                sectionTitle: l.sectionTitle,
              }))}
              notes={lessonNotesRows.map((n) => ({
                id: n.id,
                body: n.body,
                createdAt: n.createdAt.toISOString(),
                updatedAt: n.updatedAt.toISOString(),
              }))}
            />
          ) : tab === "announcements" ? (
            announcementsThread?.posts.length ? (
              <div className="divide-y divide-[#ececec] rounded-md border border-[#d1d7dc] bg-white">
                {announcementsThread.posts.slice(0, 20).map((post) => (
                  <article key={post.id} className="px-4 py-4 sm:px-5">
                    <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-sm font-bold text-[var(--foreground)]">
                        {post.author.fullName}
                      </p>
                      <time
                        dateTime={post.createdAt.toISOString()}
                        className="text-[11px] tabular-nums text-[var(--muted-soft)]"
                      >
                        {post.createdAt.toLocaleDateString(undefined, {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </time>
                    </div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
                      {post.author.role}
                    </p>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-[var(--muted)]">
                      {post.body}
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <div className="rounded-md border border-[#ececec] bg-[#fafafa] px-6 py-12 text-center">
                <p className="text-base font-bold text-[var(--foreground)]">
                  No announcements yet
                </p>
                <p className="mx-auto mt-2 max-w-md text-sm text-[var(--muted)]">
                  Your mentor can post updates here from the course overview.
                  Check back later for schedules, reminders, and news.
                </p>
              </div>
            )
          ) : tab === "forum" && forumData ? (
            <CourseForumExperience
              courseId={courseId}
              courseTitle={course.title}
              sessionUserId={session.user.id}
              posts={forumData.thread?.posts ?? []}
              badgeCountByStudent={forumData.badgeCountByStudent}
              variant="student"
              embedded
            />
          ) : tab === "ai-quiz" ? (
            <AiQuizWorkspace
              courseId={course.id}
              courseTitle={course.title}
              completedSectionsCount={completedSectionIdsForAi.length}
              embedded
            />
          ) : tab === "reviews" ? (
            <CourseReviewsTab
              courseId={courseId}
              canLeaveReview={canLeaveReview}
              initialRating={existingReview?.rating ?? null}
              initialComment={existingReview?.comment ?? null}
              ratingAverage={ratingAverage}
              reviewCount={reviewCount}
              distribution={ratingDistribution}
              reviews={reviewList}
            />
          ) : null}
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
            intelHeading="Course content"
            intelBadge={mintBadge}
            sections={sidebarSections}
            selectedLessonId={selectedId}
            progressMap={progressMap}
            currentTab={tab}
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
