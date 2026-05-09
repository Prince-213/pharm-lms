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
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white">
      <div className="flex items-center justify-between border-b border-[#d1d7dc] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#1c1d1f]">Curriculum</h1>
      </div>
      <CurriculumEditorV2Dynamic courseId={courseId} />
    </section>
  );
}
