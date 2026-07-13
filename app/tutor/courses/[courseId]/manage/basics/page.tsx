import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  CourseLandingForm,
  type CourseLandingInitial,
} from "@/components/mentor/course-landing-form";
import { db } from "@/lib/db";

export default async function MentorCourseBasicsPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");

  const { courseId } = await params;
  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
  });
  if (!course) notFound();

  const initial: CourseLandingInitial = {
    title: course.title,
    subtitle: course.subtitle,
    description: course.description,
    language: course.language,
    level: course.level,
    category: course.category,
    subcategory: course.subcategory,
    primaryTopic: course.primaryTopic,
    thumbnailUrl: course.thumbnailUrl,
    promoVideoUrl: course.promoVideoUrl,
    estimatedDurationMinutes: course.estimatedDurationMinutes,
  };

  return (
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">
          Course landing page
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Title, description, basics, and media students see before enrolling.
        </p>
      </div>
      <CourseLandingForm courseId={courseId} initial={initial} />
    </section>
  );
}
