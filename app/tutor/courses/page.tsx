import { Plus } from "lucide-react";
import Link from "next/link";
import { auth } from "@/auth";
import { TutorCoursesList } from "@/components/mentor/tutor-courses-list";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CoursePurchaseStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";

export default async function MentorCoursesPage() {
  const session = await auth();
  const tutorId = session?.user?.id;
  const isTutor = session?.user?.role === UserRole.TUTOR;

  const [courses, tutorProfile] = await Promise.all([
    tutorId
      ? db.course.findMany({
          where: { mentorId: tutorId },
          orderBy: { updatedAt: "desc" },
          select: {
            id: true,
            title: true,
            status: true,
            thumbnailUrl: true,
            updatedAt: true,
            _count: {
              select: {
                purchases: {
                  where: { status: CoursePurchaseStatus.SUCCESS },
                },
              },
            },
          },
        })
      : Promise.resolve([]),
    isTutor && tutorId
      ? db.user.findUnique({
          where: { id: tutorId },
          select: { tutorProfileCompletedAt: true },
        })
      : Promise.resolve(null),
  ]);

  const rows = await Promise.all(
    courses.map(async (c) => ({
      id: c.id,
      title: c.title,
      status: c.status,
      thumbnailUrl: await resolveMediaUrl(c.thumbnailUrl),
      purchaseCount: c._count.purchases,
      updatedAtIso: c.updatedAt.toISOString(),
    })),
  );

  const firstCourseTitle = rows[0]?.title ?? null;
  const profileIncomplete = isTutor && !tutorProfile?.tutorProfileCompletedAt;

  return (
    <div className="w-full px-6 py-10 sm:px-8 lg:px-10">
      {profileIncomplete ? (
        <section className="mb-8 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-950">
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-800">
            Profile setup
          </p>
          <p className="mt-1 font-semibold">Finish your instructor profile</p>
          <p className="mt-1 text-xs leading-relaxed text-amber-900/90">
            Complete required profile fields to appear in the student tutor
            directory. Activation happens automatically when you save a complete
            profile — no admin approval needed.
          </p>
          <p className="mt-3 text-xs">
            <Link href="/tutor/profile" className="font-semibold underline">
              Complete profile
            </Link>
          </p>
        </section>
      ) : null}

      <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
        <h1 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
          Courses
        </h1>
        <Button asChild size="lg">
          <Link href="/tutor/courses/new/step-2">
            <Plus className="h-4 w-4" strokeWidth={2.5} />
            New Course
          </Link>
        </Button>
      </div>

      <Card className="mb-10 shadow-sm">
        <CardContent className="flex flex-wrap gap-8 px-8 py-6">
        <div className="min-w-0 flex-1">
          <span className="inline-block rounded bg-primary px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary-foreground">
            New
          </span>
          <h2 className="mt-2 font-display text-xl font-bold text-foreground">
            Create clinical practice tests for your students
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            Improve student outcomes with practice-style assessments. When quiz
            authoring ships, you will be able to add mock exams alongside video
            and article lessons.
          </p>
          <button
            type="button"
            className="mt-4 border-b-2 border-primary/25 pb-0.5 text-sm font-semibold text-primary opacity-70"
            disabled
          >
            Learn more
          </button>
        </div>
        </CardContent>
      </Card>

      <TutorCoursesList courses={rows} firstCourseTitle={firstCourseTitle} />
    </div>
  );
}
