import { GraduationCap, Microscope } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import type { MeetingAvailabilityRow } from "@/components/student/meeting-booking-modal";
import { MeetingBookingModal } from "@/components/student/meeting-booking-modal";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import {
  CourseStatus,
  MentorProfileStatus,
  UserRole,
} from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { formatMinorUnitsToCurrency } from "@/lib/format-currency";
import { resolveMediaUrl } from "@/lib/media-url";
import {
  consultationBlockMinutes,
  formatNextOpeningLabel,
} from "@/lib/meetings/mentor-availability-helpers";
import { roleHomePath } from "@/lib/rbac";

const availabilitySelect = {
  where: { isRecurring: true },
  orderBy: { dayOfWeek: "asc" as const },
  select: {
    dayOfWeek: true,
    startTime: true,
    endTime: true,
    timezone: true,
  },
};

export default async function StudentMeetingHostPage({
  params,
  searchParams,
}: {
  params: Promise<{ hostId: string }>;
  searchParams: Promise<{ courseId?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/meetings");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { hostId } = await params;
  const { courseId } = await searchParams;

  if (courseId) {
    const enrollment = await db.enrollment.findUnique({
      where: {
        courseId_studentId: {
          courseId,
          studentId: session.user.id,
        },
      },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            subtitle: true,
            mentorId: true,
            priceMinorUnits: true,
            priceCurrency: true,
          },
        },
      },
    });
    if (!enrollment || enrollment.course.mentorId !== hostId) {
      redirect("/student/meetings");
    }

    const [instructor, learnersReached, publishedCourses] = await Promise.all([
      db.user.findFirst({
        where: {
          id: hostId,
          role: { in: [UserRole.TUTOR, UserRole.MENTOR] },
        },
        select: {
          id: true,
          fullName: true,
          bio: true,
          avatarUrl: true,
          mentorHeadline: true,
          createdAt: true,
          availability: availabilitySelect,
        },
      }),
      db.enrollment.count({
        where: {
          course: { mentorId: hostId },
        },
      }),
      db.course.count({
        where: { mentorId: hostId, status: CourseStatus.PUBLISHED },
      }),
    ]);

    if (!instructor) notFound();

    const avatarSrc = await resolveMediaUrl(instructor.avatarUrl);
    const availabilityRows: MeetingAvailabilityRow[] =
      instructor.availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        startTime: a.startTime,
        endTime: a.endTime,
      }));
    const timezoneLabel =
      instructor.availability[0]?.timezone ?? "Instructor local time";
    const nextOpen = formatNextOpeningLabel(availabilityRows);
    const consultMins = consultationBlockMinutes(availabilityRows);
    const sessionDurationLabel = `${consultMins} minutes`;
    const feeLabel = formatMinorUnitsToCurrency(
      enrollment.course.priceMinorUnits,
      enrollment.course.priceCurrency,
    );
    const memberYear = new Date(instructor.createdAt).getFullYear();

    const bioText =
      instructor.bio?.trim() ||
      "Your instructor supports structured discussions, exam preparation, and practical reasoning.";
    const bioParagraphs = bioText
      .split(/\n\n+/)
      .map((p) => p.trim())
      .filter(Boolean);
    const sentences = bioText
      .split(/(?<=[.!?])\s+/)
      .map((s) => s.trim())
      .filter((s) => s.length > 0);
    const clinicalBlurb =
      sentences[0] ??
      `Leads instruction for ${enrollment.course.title}, with a focus on clear outcomes.`;
    const researchBlurb =
      sentences.slice(1, 3).join(" ").trim() ||
      "Hosts live sessions and keeps material aligned with current practice expectations.";

    const tagline =
      instructor.mentorHeadline?.trim() ||
      enrollment.course.subtitle?.trim() ||
      `Instructor for ${enrollment.course.title}.`;

    const initials = instructor.fullName
      .split(" ")
      .map((p) => p[0])
      .join("")
      .slice(0, 2)
      .toUpperCase();

    return (
      <div className="space-y-6 text-[var(--foreground)]">
        <StudentSecondaryNav />

        <Link
          href="/student/meetings"
          className="inline-flex text-xs font-bold text-[var(--primary)] hover:underline"
        >
          ← Back to meetings
        </Link>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)] lg:items-start">
          <div className="space-y-6">
            <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                  <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-muted)] shadow-[var(--shadow-sm)]">
                    {avatarSrc ? (
                      <Image
                        src={avatarSrc}
                        alt={instructor.fullName}
                        fill
                        className="object-cover"
                        sizes="7rem"
                        unoptimized={avatarSrc.startsWith("http")}
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[var(--primary)]">
                        {initials}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-soft-text)]">
                      Course instructor (tutor)
                    </p>
                    <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-[var(--ink-deep)] sm:text-3xl">
                      {instructor.fullName}
                    </h1>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                      {tagline}
                    </p>
                  </div>
                </div>

                <div className="mt-8 grid grid-cols-3 gap-3 border-t border-[var(--border-subtle)] pt-8 sm:gap-6">
                  <div className="text-center sm:text-left">
                    <p className="font-display text-xl font-bold tabular-nums text-[var(--ink-deep)] sm:text-2xl">
                      {learnersReached >= 1000
                        ? `${Math.floor(learnersReached / 1000)}k+`
                        : `${learnersReached}`}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                      Learners reached
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-display text-xl font-bold tabular-nums text-[var(--ink-deep)] sm:text-2xl">
                      {publishedCourses}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                      Published courses
                    </p>
                  </div>
                  <div className="text-center sm:text-left">
                    <p className="font-display text-xl font-bold tabular-nums text-[var(--ink-deep)] sm:text-2xl">
                      {memberYear}
                    </p>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                      Teaching since
                    </p>
                  </div>
                </div>
              </div>
            </section>

            <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
              <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted-soft)]">
                Biography
              </h2>
              <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
                {bioParagraphs.length ? (
                  bioParagraphs.map((para) => <p key={para}>{para}</p>)
                ) : (
                  <p>{bioText}</p>
                )}
              </div>
            </section>

            <div className="grid gap-4 sm:grid-cols-2">
              <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)]/80 p-5 shadow-[var(--shadow-sm)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--primary)]">
                  <GraduationCap className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-[var(--ink-deep)]">
                  Instruction
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  {clinicalBlurb}
                </p>
              </article>
              <article className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface-muted)]/80 p-5 shadow-[var(--shadow-sm)]">
                <div className="flex h-10 w-10 items-center justify-center rounded-[var(--radius-md)] bg-[var(--surface)] text-[var(--primary)]">
                  <Microscope className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <h3 className="mt-3 text-sm font-bold text-[var(--ink-deep)]">
                  Live support
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                  {researchBlurb}
                </p>
              </article>
            </div>
          </div>

          <aside className="lg:sticky lg:top-6">
            <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
              <h2 className="font-display text-lg font-bold text-[var(--ink-deep)]">
                Book a session
              </h2>
              <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
                One-on-one video call (Jitsi) aligned with your course. Choose a
                slot from your instructor’s availability.
              </p>

              <ul className="mt-6 space-y-4 text-sm">
                <li className="flex flex-col gap-0.5 border-b border-[var(--border-subtle)] pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                    Next availability
                  </span>
                  <span className="font-semibold text-[var(--primary)]">
                    {nextOpen}
                  </span>
                  <span className="text-[11px] text-[var(--muted-soft)]">
                    {timezoneLabel}
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 border-b border-[var(--border-subtle)] pb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                    Session length
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {sessionDurationLabel}
                  </span>
                </li>
                <li className="flex flex-col gap-0.5 pb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                    Course price
                  </span>
                  <span className="font-semibold text-[var(--foreground)]">
                    {feeLabel}
                  </span>
                  <span className="text-[11px] text-[var(--muted-soft)]">
                    Consultations are included with enrollment when offered by
                    your instructor.
                  </span>
                </li>
              </ul>

              <div className="mt-6">
                {instructor.availability.length ? (
                  <MeetingBookingModal
                    courseId={enrollment.course.id}
                    mentorId={instructor.id}
                    mentorName={instructor.fullName}
                    availability={availabilityRows}
                    primaryCta="Book with instructor"
                  />
                ) : (
                  <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4 text-center text-xs font-medium text-[var(--muted)]">
                    No weekly hours published yet. Check back soon.
                  </p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    );
  }

  const mentor = await db.user.findFirst({
    where: {
      id: hostId,
      role: UserRole.MENTOR,
      mentorProfileStatus: MentorProfileStatus.APPROVED,
    },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
      createdAt: true,
      availability: availabilitySelect,
    },
  });
  if (!mentor) notFound();

  const avatarSrc = await resolveMediaUrl(mentor.avatarUrl);
  const availabilityRows: MeetingAvailabilityRow[] = mentor.availability.map(
    (a) => ({
      dayOfWeek: a.dayOfWeek,
      startTime: a.startTime,
      endTime: a.endTime,
    }),
  );
  const timezoneLabel = mentor.availability[0]?.timezone ?? "Mentor local time";
  const nextOpen = formatNextOpeningLabel(availabilityRows);
  const consultMins = consultationBlockMinutes(availabilityRows);
  const sessionDurationLabel = `${consultMins} minutes`;
  const memberYear = new Date(mentor.createdAt).getFullYear();

  const bioText =
    mentor.bio?.trim() ||
    "This mentor is available for one-on-one sessions through Pharm LMS.";
  const bioParagraphs = bioText
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean);

  const initials = mentor.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-6 text-[var(--foreground)]">
      <StudentSecondaryNav />

      <Link
        href="/student/meetings"
        className="inline-flex text-xs font-bold text-[var(--primary)] hover:underline"
      >
        ← Back to meetings
      </Link>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_min(100%,22rem)] lg:items-start">
        <div className="space-y-6">
          <section className="overflow-hidden rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-sm)]">
            <div className="p-6 sm:p-8">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="relative h-28 w-28 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border-subtle)] bg-[var(--surface-muted)] shadow-[var(--shadow-sm)]">
                  {avatarSrc ? (
                    <Image
                      src={avatarSrc}
                      alt={mentor.fullName}
                      fill
                      className="object-cover"
                      sizes="7rem"
                      unoptimized={avatarSrc.startsWith("http")}
                    />
                  ) : (
                    <span className="flex h-full w-full items-center justify-center font-display text-2xl font-bold text-[var(--primary)]">
                      {initials}
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-soft-text)]">
                    Mentor (coaching)
                  </p>
                  <h1 className="font-display mt-3 text-2xl font-bold tracking-tight text-[var(--ink-deep)] sm:text-3xl">
                    {mentor.fullName}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                    {mentor.mentorHeadline?.trim() ||
                      "Book a private mentoring session. Video is powered by Jitsi."}
                  </p>
                </div>
              </div>

              <div className="mt-8 border-t border-[var(--border-subtle)] pt-8">
                <p className="font-display text-xl font-bold tabular-nums text-[var(--ink-deep)] sm:text-2xl">
                  {memberYear}
                </p>
                <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                  On Pharm LMS since
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-sm)] sm:p-8">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--muted-soft)]">
              About
            </h2>
            <div className="mt-4 space-y-4 text-sm leading-relaxed text-[var(--muted)]">
              {bioParagraphs.length ? (
                bioParagraphs.map((para) => <p key={para}>{para}</p>)
              ) : (
                <p>{bioText}</p>
              )}
            </div>
          </section>
        </div>

        <aside className="lg:sticky lg:top-6">
          <div className="rounded-[var(--radius-xl)] border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow-md)]">
            <h2 className="font-display text-lg font-bold text-[var(--ink-deep)]">
              Book a session
            </h2>
            <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]">
              Request a time that fits your mentor’s weekly availability. They’ll
              confirm or suggest another slot.
            </p>

            <ul className="mt-6 space-y-4 text-sm">
              <li className="flex flex-col gap-0.5 border-b border-[var(--border-subtle)] pb-4">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                  Next availability
                </span>
                <span className="font-semibold text-[var(--primary)]">
                  {nextOpen}
                </span>
                <span className="text-[11px] text-[var(--muted-soft)]">
                  {timezoneLabel}
                </span>
              </li>
              <li className="flex flex-col gap-0.5 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-wide text-[var(--muted-soft)]">
                  Session length
                </span>
                <span className="font-semibold text-[var(--foreground)]">
                  {sessionDurationLabel}
                </span>
              </li>
            </ul>

            <div className="mt-6">
              {mentor.availability.length ? (
                <MeetingBookingModal
                  mentorId={mentor.id}
                  mentorName={mentor.fullName}
                  availability={availabilityRows}
                  primaryCta="Request mentoring session"
                />
              ) : (
                <p className="rounded-[var(--radius-lg)] border border-dashed border-[var(--border)] bg-[var(--surface-muted)] px-4 py-4 text-center text-xs font-medium text-[var(--muted)]">
                  This mentor has not set weekly hours yet.
                </p>
              )}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
