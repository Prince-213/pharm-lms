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
    <section className="mx-auto max-w-[900px] border border-[var(--border)] bg-[var(--surface)]">
      <div className="border-b border-[var(--border)] px-6 py-4">
        <h1 className="text-2xl font-bold text-[var(--foreground)]">Pricing</h1>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Set your course list price in Nigerian Naira.
        </p>
      </div>
      <CoursePricingForm
        courseId={courseId}
        initialMinorUnits={course.priceMinorUnits}
      />
    </section>
  );
}
