import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CoursePricingForm } from "@/components/mentor/course-pricing-form";
import { db } from "@/lib/db";

export default async function MentorCoursePricingPage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/tutor/login");

  const { courseId } = await params;
  const course = await db.course.findFirst({
    where: { id: courseId, mentorId: session.user.id },
    select: { priceMinorUnits: true },
  });
  if (!course) notFound();

  return (
    <section className="mx-auto max-w-[900px] border border-[#d1d7dc] bg-white">
      <div className="border-b border-[#d1d7dc] px-6 py-4">
        <h1 className="text-2xl font-bold text-[#1c1d1f]">Pricing</h1>
        <p className="mt-1 text-sm text-[#6a6f73]">
          Set your course list price in Nigerian Naira.
        </p>
      </div>
      <CoursePricingForm courseId={courseId} initialMinorUnits={course.priceMinorUnits} />
    </section>
  );
}
