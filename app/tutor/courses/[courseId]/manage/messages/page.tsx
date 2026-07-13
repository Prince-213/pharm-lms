import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import {
  CourseMessagesForm,
  type CourseMessagesInitial,
} from "@/components/mentor/course-messages-form";
import { db } from "@/lib/db";

export default async function MentorCourseMessagesPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");

  const { courseId } = await params;
  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: {
      welcomeMessage: true,
      congratulatoryTitle: true,
      congratulatoryContentType: true,
      congratulatoryArticle: true,
      congratulatoryVideoUrl: true,
    },
  });
  if (!course) notFound();

  const initial: CourseMessagesInitial = {
    welcomeMessage: course.welcomeMessage,
    congratulatoryTitle: course.congratulatoryTitle,
    congratulatoryContentType: course.congratulatoryContentType,
    congratulatoryArticle: course.congratulatoryArticle,
    congratulatoryVideoUrl: course.congratulatoryVideoUrl,
  };

  return (
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
      <div className="border-b border-[#d1d7dc] px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Course messages
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Automated messages for enrollment and course completion.
        </p>
      </div>
      <CourseMessagesForm courseId={courseId} initial={initial} />
    </section>
  );
}
