import { BookOpen, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { Card, CardContent } from "@/components/ui/card";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { resolveMediaUrl } from "@/lib/media-url";
import { roleHomePath } from "@/lib/rbac";
import { cn } from "@/lib/utils";

export default async function StudentTutorDetailPage({
  params,
}: {
  params: Promise<{ tutorId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/tutors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { tutorId } = await params;

  const tutor = await db.user.findFirst({
    where: { id: tutorId, role: UserRole.TUTOR },
    select: {
      id: true,
      fullName: true,
      bio: true,
      avatarUrl: true,
      mentorHeadline: true,
    },
  });
  if (!tutor) notFound();

  const courses = await db.enrollment.findMany({
    where: {
      studentId: session.user.id,
      course: { mentorId: tutorId },
    },
    orderBy: { enrolledAt: "desc" },
    select: {
      course: {
        select: {
          id: true,
          title: true,
          subtitle: true,
        },
      },
    },
  });

  if (courses.length === 0) notFound();

  const avatarSrc = await resolveMediaUrl(tutor.avatarUrl);
  const initials = tutor.fullName
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      <StudentSecondaryNav />

      <Link
        href="/student/tutors"
        className="inline-flex text-xs font-semibold text-[var(--primary)] hover:underline"
      >
        ← Back to Tutors
      </Link>

      <Card className="overflow-hidden border-[var(--border)] shadow-[var(--shadow-sm)]">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface-muted)]">
              {avatarSrc ? (
                <Image
                  src={avatarSrc}
                  alt={tutor.fullName}
                  fill
                  className="object-cover"
                  sizes="6rem"
                  unoptimized={avatarSrc.startsWith("http")}
                />
              ) : (
                <span className="flex h-full w-full items-center justify-center font-display text-xl font-bold text-[var(--primary)]">
                  {initials}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="inline-flex rounded-full bg-[var(--primary-soft)] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--primary-soft-text)]">
                Course tutor
              </p>
              <h1 className="font-display mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
                {tutor.fullName}
              </h1>
              {tutor.mentorHeadline?.trim() ? (
                <p className="mt-2 text-sm font-semibold text-[var(--muted)]">
                  {tutor.mentorHeadline.trim()}
                </p>
              ) : null}
              <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
                {tutor.bio?.trim() ||
                  "Book a session for one of your enrolled courses below."}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <section className="space-y-3">
        <h2 className="text-base font-semibold">
          Your courses with this tutor
        </h2>
        <p className="text-xs text-[var(--muted)]">
          Booking opens the full host page with availability and fees for that
          course.
        </p>
        <ul className="space-y-2">
          {courses.map(({ course }) => (
            <li key={course.id}>
              <Link
                href={`/student/meetings/host/${tutor.id}?courseId=${course.id}`}
                className={cn(
                  "flex items-center justify-between gap-3 rounded-[var(--radius-lg)] border border-[var(--border)] bg-[var(--surface)] px-4 py-3 shadow-[var(--shadow-sm)] transition-colors",
                  "hover:border-[var(--primary)]/30 hover:bg-[var(--surface-muted)]/50",
                )}
              >
                <div className="min-w-0">
                  <p className="flex items-center gap-2 font-medium leading-snug">
                    <BookOpen
                      className="h-4 w-4 shrink-0 text-[var(--muted)]"
                      aria-hidden
                    />
                    <span className="truncate">{course.title}</span>
                  </p>
                  {course.subtitle?.trim() ? (
                    <p className="mt-0.5 truncate text-xs text-[var(--muted)]">
                      {course.subtitle.trim()}
                    </p>
                  ) : null}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-[var(--primary)]">
                  Book
                  <ChevronRight className="h-4 w-4" aria-hidden />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
