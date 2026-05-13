import { BookOpen } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { MeetingHostCard } from "@/components/meetings/meeting-host-card";
import { StudentSecondaryNav } from "@/components/student/student-secondary-nav";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentTutorsPage() {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/tutors");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const enrollments = await db.enrollment.findMany({
    where: { studentId: session.user.id },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          mentor: {
            select: {
              id: true,
              fullName: true,
              bio: true,
              avatarUrl: true,
              role: true,
            },
          },
        },
      },
    },
  });

  const tutorMap = new Map<
    string,
    {
      id: string;
      fullName: string;
      bio: string | null;
      avatarUrl: string | null;
      courseIds: Set<string>;
    }
  >();

  for (const enrollment of enrollments) {
    const host = enrollment.course.mentor;
    if (host.role !== UserRole.TUTOR) continue;
    const existing = tutorMap.get(host.id);
    if (existing) {
      existing.courseIds.add(enrollment.course.id);
      continue;
    }
    tutorMap.set(host.id, {
      id: host.id,
      fullName: host.fullName,
      bio: host.bio,
      avatarUrl: host.avatarUrl ?? null,
      courseIds: new Set([enrollment.course.id]),
    });
  }

  const tutors = Array.from(tutorMap.values()).sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );

  return (
    <div className="space-y-8 text-[var(--foreground)]">
      {/* <StudentSecondaryNav /> */}

      <header className="space-y-2">
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          Tutors
        </h1>
        <p className="max-w-2xl text-sm leading-relaxed text-[var(--muted)]">
          Course instructors from your enrollments. Open a profile to book a
          session with the right course context.
        </p>
      </header>

      {tutors.length ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tutors.map((row) => (
            <MeetingHostCard
              key={row.id}
              href={`/student/tutors/${row.id}`}
              fullName={row.fullName}
              bio={row.bio}
              fallbackBio="Course instructor — book with course context."
              avatarUrl={row.avatarUrl}
              rows={[
                {
                  icon: BookOpen,
                  text: `${row.courseIds.size} course${row.courseIds.size === 1 ? "" : "s"} you're enrolled in`,
                },
              ]}
              ctaLabel="View profile"
            />
          ))}
        </ul>
      ) : (
        <div className="rounded-[var(--radius-xl)] border border-dashed border-[var(--border)] bg-[var(--surface)] px-6 py-12 text-center text-sm text-[var(--muted)]">
          <p>You don’t have any tutor-led enrollments yet.</p>
          <Link
            href="/student/browse"
            className="mt-3 inline-flex text-sm font-semibold text-[var(--primary)] hover:underline"
          >
            Browse courses
          </Link>
        </div>
      )}
    </div>
  );
}
