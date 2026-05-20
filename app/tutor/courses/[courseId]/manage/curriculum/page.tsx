import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import CurriculumEditorV2Dynamic from "@/components/mentor/curriculum-editor-v2-dynamic";
import { db } from "@/lib/db";

export default async function MentorCourseCurriculumPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");

  const { courseId } = await params;
  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: { id: true },
  });
  if (!course) notFound();

  return (
    <section className="mx-auto w-full max-w-full border-0 bg-[var(--surface)] lg:max-w-[900px] lg:border lg:border-[var(--border)]">
      <div className="flex items-center justify-between border-b border-[var(--border)] px-4 py-3 sm:px-6 sm:py-4">
        <h1 className="text-xl font-bold text-[var(--foreground)] sm:text-2xl">
          Curriculum
        </h1>
      </div>
      <CurriculumEditorV2Dynamic courseId={courseId} />
    </section>
  );
}
