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
    <section className="mx-auto w-full max-w-full bg-white lg:max-w-[960px] lg:border lg:border-[#d1d7dc] lg:shadow-[0_2px_4px_rgba(0,0,0,0.08)]">
      <div className="space-y-1 border-b border-[#d1d7dc] px-4 py-4 sm:px-6 sm:py-5">
        <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
          Curriculum
        </h1>
        <p className="max-w-2xl text-sm text-muted-foreground">
          Structure your course into sections and lectures. Drag sections to
          reorder, expand each section to add content, and use Next when you are
          ready to validate and continue.
        </p>
      </div>
      <CurriculumEditorV2Dynamic courseId={courseId} />
    </section>
  );
}
