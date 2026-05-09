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
  };

  return (
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white">
      <div className="border-b border-[#d1d7dc] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#1c1d1f]">
          Course landing page
        </h1>
        <p className="mt-1 text-sm text-[#6a6f73]">
          Title, description, basics, and media students see before enrolling.
        </p>
      </div>
      <CourseLandingForm courseId={courseId} initial={initial} />
    </section>
  );
}
