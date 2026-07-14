import { BookOpen } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { auth } from "@/auth";
import { CourseForumExperience } from "@/components/course-forum/course-forum-experience";
import { AiQuizWorkspace } from "@/components/student/ai-quiz-workspace";
import { CourseChatBubble } from "@/components/student/course-chat-bubble";
import { CourseCompletionCta } from "@/components/student/course-completion-cta";
import { CourseContentSidebar } from "@/components/student/course-content-sidebar";
import { CourseNotesTab } from "@/components/student/course-notes-tab";
import { CoursePlayerWorkspace } from "@/components/student/course-player-workspace";
import { CourseReviewsTab } from "@/components/student/course-reviews-tab";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
import { studentHasPaidCourseAccess } from "@/lib/payments/student-course-access";
import { buildCoursePlayerHref } from "@/lib/student/course-player-href";

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
        level: true,
        category: true,
        priceMinorUnits: true,
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

  const paidOk = await studentHasPaidCourseAccess(session.user.id, {
    id: course.id,
    priceMinorUnits: course.priceMinorUnits,
  });
  if (!paidOk) redirect(`/student/browse/${courseId}`);
  const congratulatoryVideoSrc = await resolveMediaUrl(
    course.congratulatoryVideoUrl,
  );

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
  const selected = selectedShell
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
    : null;
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
    passedSectionQuizRows,
  ] = await Promise.all([
    db.lessonProgress.findMany({
      where: {
        studentId: session.user.id,
        lesson: { section: { courseId } },
      },
      select: { lessonId: true, completed: true },
    }),
    db.forumThread.findFirst({
      where: { courseId, title: COURSE_ANNOUNCEMENTS_THREAD_TITLE },
      include: {
        posts: {
          orderBy: { createdAt: "desc" },
          include: { author: { select: { fullName: true, role: true } } },
        },
      },
    }),
    getCourseForumData(courseId),
    Promise.all([
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
    ]),
    selectedId
      ? db.studentLessonNote.findMany({
          where: { studentId: session.user.id, lessonId: selectedId },
          orderBy: { createdAt: "desc" },
          select: { id: true, body: true, createdAt: true, updatedAt: true },
        })
      : Promise.resolve([]),
    db.lessonProgress.findMany({
      where: {
        studentId: session.user.id,
        completed: true,
        lesson: { section: { courseId } },
      },
      select: { lesson: { select: { sectionId: true } } },
    }),
    studentHasCompletedAtLeastOneFullSection(session.user.id, courseId),
    db.sectionQuizAttempt.findMany({
      where: {
        studentId: session.user.id,
        score: { gte: 70 },
        quiz: { section: { courseId } },
      },
      select: { quiz: { select: { sectionId: true } } },
    }),
  ]);

  const progressMap: Record<string, boolean> = {};
  for (const p of progressRows) {
    if (p.completed) progressMap[p.lessonId] = true;
  }

  const completedCount = flat.filter((l) => progressMap[l.id]).length;
  const totalLessons = flat.length;
  const progressPct =
    totalLessons > 0 ? Math.round((completedCount / totalLessons) * 100) : 0;

  const enrollmentAllowsReview =
    enrollment.status === EnrollmentStatus.ACTIVE ||
    enrollment.status === EnrollmentStatus.COMPLETED;
  const canLeaveReview = enrollmentAllowsReview && hasFullSectionComplete;
  const existingReview = reviewData[3] ?? null;

  const reviewAgg = reviewData[0];
  const reviewGrouped = reviewData[1];
  const reviewList = reviewData[2];
  const reviewCount = reviewAgg._count ?? 0;
  const ratingAverage =
    reviewCount > 0 && reviewAgg._avg.rating != null
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
  const sectionQuizPassedIds = new Set(
    passedSectionQuizRows.map((row) => row.quiz.sectionId),
  );

  const videoSrc = selected?.videoUrl
    ? selected.videoUrl.startsWith("r2://")
      ? `/api/student/lessons/${selected.id}/stream`
      : selected.videoUrl
    : null;

  const base = `/student/course/${courseId}`;
  const qs = (lessonId: string | null, t: string) =>
    buildCoursePlayerHref(courseId, lessonId, t);

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
        quizzes: s.quizzes.map((q) => ({
          id: q.id,
          title: q.title,
          questions: q.questions,
        })),
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

  const lessonNav = selected
    ? {
        prevHref: prevLesson ? qs(prevLesson.id, tab) : null,
        nextHref: nextLesson ? qs(nextLesson.id, tab) : null,
        prevTitle: prevLesson?.title ?? null,
        nextTitle: nextLesson?.title ?? null,
        lessonIndex: idx >= 0 ? idx + 1 : undefined,
        totalLessons,
      }
    : null;

  const stage = !selected ? (
    <div className="flex flex-1 items-center justify-center p-8 text-center text-sm text-primary-foreground/90">
      This course has no lessons yet.
    </div>
  ) : (
    <div className="relative flex flex-col bg-slate-950 px-0 sm:px-4 sm:py-6 lg:py-10">
      <div className="relative mx-auto w-full max-w-6xl">
        <div className="relative aspect-video overflow-hidden rounded-none sm:rounded-2xl bg-black shadow-[0_0_80px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
          {videoSrc ? (
            // biome-ignore lint/a11y/useMediaCaption: Lesson videos use mentor-provided files; captions not modeled in schema yet.
            <video
              key={selected.id}
              controls
              className="h-full w-full object-contain"
              src={videoSrc}
              preload="metadata"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-slate-900/50 px-6 text-center">
              <div className="max-w-md space-y-4">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-white/5 text-white/40 ring-1 ring-white/10">
                  <BookOpen className="h-8 w-8" />
                </div>
                <h3 className="text-lg font-bold tracking-tight text-white">
                  Article Lesson
                </h3>
                <p className="text-sm text-slate-400">
                  This lesson is reading-based. Use the Overview panel below to
                  study the content.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!selected) {
    return (
      <ProgressProvider courseId={courseId} initialProgress={{ ...progressMap }}>
        <CoursePlayerWorkspace
          initialTab={tab}
          courseId={courseId}
          lessonId=""
          stage={stage}
          courseTitle={course.title}
          lessonLine={lessonLine}
          progressPct={progressPct}
          totalLessons={totalLessons}
          sidebar={
            <CourseContentSidebar
              courseId={courseId}
              intelHeading="Course content"
              intelBadge={mintBadge}
              sections={sidebarSections}
              selectedLessonId={selectedId}
              progressMap={progressMap}
              currentTab={tab}
              lessonNav={lessonNav}
              currentSectionId={null}
              sectionQuizPassedIds={[...sectionQuizPassedIds]}
              sectionOrder={course.sections.map((s) => s.id)}
            />
          }
          completionCta={null}
          actionGroup={{ initialCompleted: false, quizzes: [] }}
          tabPanels={{
            overview: null,
            notes: null,
            announcements: null,
            forum: null,
            aiQuiz: null,
            reviews: null,
          }}
        />
      </ProgressProvider>
    );
  }

  const tabPanels = {
    overview: (
      <div className="space-y-6">
        <div className="space-y-1">
          <Badge
            variant="mint"
            className="h-5 text-[9px] font-black uppercase tracking-widest"
          >
            Now Playing
          </Badge>
          <h2 className="text-2xl font-black tracking-tight text-foreground sm:text-3xl">
            {selected.title}
          </h2>
        </div>
        {selected.content ? (
          <Card className="border-[#d1d7dc] shadow-none">
            <CardContent className="pt-6">
              <div
                className="max-w-none text-base leading-relaxed text-muted-foreground [&_a]:text-primary [&_p]:mb-4 [&_h3]:text-xl [&_h3]:font-bold [&_h3]:mt-8 [&_h3]:mb-4"
                // biome-ignore lint/security/noDangerouslySetInnerHtml: Lesson HTML from mentor editor.
                dangerouslySetInnerHTML={{ __html: selected.content }}
              />
            </CardContent>
          </Card>
        ) : (
          <Alert>
            <AlertTitle>Video lesson</AlertTitle>
            <AlertDescription>
              This video lesson does not include a separate article. Mark complete
              when you have finished watching.
            </AlertDescription>
          </Alert>
        )}
      </div>
    ),
    notes: selectedId ? (
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
    ) : null,
    announcements:
      announcementsThread?.posts.length ? (
        <Card className="overflow-hidden border-[#d1d7dc] shadow-none">
          <CardContent className="p-0">
            {announcementsThread.posts.slice(0, 20).map((post, i) => (
              <div key={post.id}>
                {i > 0 ? <Separator /> : null}
                <article className="px-5 py-6 sm:px-8">
                  <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                    <p className="text-sm font-bold text-foreground">
                      {post.author.fullName}
                    </p>
                    <time
                      dateTime={post.createdAt.toISOString()}
                      className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground"
                    >
                      {post.createdAt.toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </time>
                  </div>
                  <Badge variant="outline" className="text-[9px] font-black uppercase">
                    {post.author.role}
                  </Badge>
                  <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {post.body}
                  </p>
                </article>
              </div>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Alert>
          <AlertTitle>No announcements yet</AlertTitle>
          <AlertDescription>
            Your mentor can post updates here from the course overview. Check back
            later for schedules, reminders, and news.
          </AlertDescription>
        </Alert>
      ),
    forum: forumData ? (
      <CourseForumExperience
        courseId={courseId}
        courseTitle={course.title}
        sessionUserId={session.user.id}
        posts={forumData.thread?.posts ?? []}
        badgeCountByStudent={forumData.badgeCountByStudent}
        variant="student"
        embedded
      />
    ) : null,
    aiQuiz: (
      <AiQuizWorkspace
        courseId={course.id}
        courseTitle={course.title}
        completedSectionsCount={completedSectionIdsForAi.length}
        hasCourseContent={totalLessons > 0}
        embedded
      />
    ),
    reviews: (
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
    ),
  };

  return (
    <ProgressProvider courseId={courseId} initialProgress={{ ...progressMap }}>
      <Suspense fallback={null}>
        <CoursePlayerWorkspace
          initialTab={tab}
          courseId={courseId}
          lessonId={selected.id}
          stage={stage}
          courseTitle={course.title}
          lessonLine={lessonLine}
          progressPct={progressPct}
          totalLessons={totalLessons}
          sidebar={
            <CourseContentSidebar
              courseId={courseId}
              intelHeading="Course content"
              intelBadge={mintBadge}
              sections={sidebarSections}
              selectedLessonId={selectedId}
              progressMap={progressMap}
              currentTab={tab}
              lessonNav={lessonNav}
              currentSectionId={selectedSection?.id ?? null}
              sectionQuizPassedIds={[...sectionQuizPassedIds]}
              sectionOrder={course.sections.map((s) => s.id)}
            />
          }
          completionCta={
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
          }
          actionGroup={{
            initialCompleted: progressMap[selected.id] ?? false,
            quizzes: selectedSection?.quizzes ?? [],
          }}
          tabPanels={tabPanels}
        />
      </Suspense>
      <CourseChatBubble courseId={courseId} disabled={totalLessons === 0} />
    </ProgressProvider>
  );
}
