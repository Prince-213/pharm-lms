import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingBookingModal } from "@/components/student/meeting-booking-modal";
import { MentorWeeklySchedule } from "@/components/student/mentor-weekly-schedule";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { Card, CardContent } from "@/components/ui/card";
import { UserAvatar } from "@/components/user/user-avatar";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";

function parseSpecialtyTags(raw: string | null): string[] {
  if (!raw?.trim()) return [];
  return raw
    .split(/[,;|]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export default async function StudentMentorDetailPage({
  params,
}: {
  params: Promise<{ mentorId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/mentors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { mentorId } = await params;

  const mentor = await db.user.findFirst({
    where: {
      id: mentorId,
      role: UserRole.MENTOR,
      isActive: true,
    },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      mentorSpecialties: true,
      mentorYearsExperience: true,
    },
  });
  if (!mentor) notFound();

  const availability = await db.mentorAvailability.findMany({
    where: { mentorId: mentor.id, isRecurring: true },
    orderBy: { dayOfWeek: "asc" },
    select: { dayOfWeek: true, startTime: true, endTime: true },
  });

  const avatarSrc = await resolveMediaUrl(mentor.avatarUrl);
  const specialties = parseSpecialtyTags(mentor.mentorSpecialties);

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      <StudentSecondaryNav />

      <Link
        href="/student/mentors"
        className="inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
      >
        ← Back to Mentors
      </Link>

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-sm)]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <UserAvatar
              src={avatarSrc}
              name={mentor.fullName}
              className="h-24 w-24 rounded-[var(--radius-lg)] border border-[var(--border)]"
              fallbackClassName="font-display text-xl"
            />
            <div className="min-w-0 flex-1">
              <p className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-soft-text)]">
                Coaching mentor
              </p>
              <h1 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {mentor.fullName}
              </h1>
              {mentor.mentorHeadline?.trim() ? (
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                  {mentor.mentorHeadline.trim()}
                </p>
              ) : null}
              {mentor.mentorYearsExperience !== null ? (
                <p className="mt-1 text-xs text-[var(--muted)]">
                  {mentor.mentorYearsExperience} years of experience
                </p>
              ) : null}
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                {mentor.bio?.trim() ||
                  "Book a one-on-one coaching session to get personalized guidance."}
              </p>
              {specialties.length > 0 ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {specialties.map((tag) => (
                    <li
                      key={tag}
                      className="rounded-full border border-[var(--border)] bg-[var(--surface-muted)]/50 px-3 py-1 text-xs font-medium text-[var(--foreground)]"
                    >
                      {tag}
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">Weekly availability</h2>
        <p className="text-xs text-[var(--muted)]">
          Recurring hours when this mentor accepts booking requests.
        </p>
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="p-4 sm:p-6">
            {availability.length > 0 ? (
              <MentorWeeklySchedule availability={availability} />
            ) : (
              <p className="text-center text-sm text-[var(--muted)] py-6">
                This mentor has not published a weekly schedule yet.
              </p>
            )}
          </CardContent>
        </Card>
      </section>

      <section className="space-y-3">
        <Card className="border-[var(--border)] shadow-[var(--shadow-sm)]">
          <CardContent className="p-5 sm:p-6">
            <h2 className="text-lg font-bold">Book a session</h2>
            <p className="mt-1 text-sm text-[var(--muted)]">
              Pick a time slot that fits your schedule. Sessions are independent
              of course enrollment.
            </p>
            <div className="mt-4">
              <MeetingBookingModal
                mentorId={mentor.id}
                mentorName={mentor.fullName}
                availability={availability}
              />
            </div>
            <p className="mt-4 text-xs text-[var(--muted)]">
              Prefer the full booking page?{" "}
              <Link
                href={`/student/meetings/host/${mentor.id}`}
                className="font-semibold text-[var(--primary)] hover:underline"
              >
                Open host page
              </Link>
            </p>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
