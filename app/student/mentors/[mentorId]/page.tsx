import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingBookingModal } from "@/components/student/meeting-booking-modal";
import { MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentMentorDetailPage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login");
  if (session.user.role !== UserRole.STUDENT) redirect(roleHomePath(session.user.role));

  const { mentorId } = await params;

  const mentor = await db.user.findFirst({
    where: {
      id: mentorId,
      role: UserRole.MENTOR,
      mentorProfileStatus: MentorProfileStatus.APPROVED,
      isActive: true,
    },
    select: { id: true, fullName: true, bio: true, avatarUrl: true },
  });
  if (!mentor) notFound();

  const availability = await db.mentorAvailability.findMany({
    where: { mentorId: mentor.id, isRecurring: true },
    orderBy: { dayOfWeek: "asc" },
    select: { dayOfWeek: true, startTime: true, endTime: true },
  });

  return (
    <div className="mx-auto max-w-3xl space-y-6 px-6 py-10 text-[var(--foreground)]">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 overflow-hidden rounded-full border border-[var(--border)] bg-[var(--surface-muted)]">
          {mentor.avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mentor.avatarUrl} alt="" className="h-full w-full object-cover" />
          ) : null}
        </div>
        <div className="min-w-0">
          <h1 className="font-display text-2xl font-extrabold tracking-tight">
            {mentor.fullName}
          </h1>
          <p className="mt-2 text-sm text-[var(--muted)]">
            {mentor.bio?.trim() || "Mentor profile available."}
          </p>
        </div>
      </div>

      <section className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5">
        <h2 className="text-lg font-bold">Book a session</h2>
        <p className="mt-1 text-sm text-[var(--muted)]">
          Pick a time slot that fits your schedule.
        </p>
        <div className="mt-4">
          <MeetingBookingModal
            mentorId={mentor.id}
            mentorName={mentor.fullName}
            availability={availability}
          />
        </div>
      </section>
    </div>
  );
}

