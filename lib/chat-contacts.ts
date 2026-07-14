import { EnrollmentStatus, MentorProfileStatus, UserRole } from "@/generated/prisma/enums";
import type { ChatContactOption } from "@/components/chat/new-message-dialog";
import { db } from "@/lib/db";

/** Tutors of enrolled courses + active mentors students can reach. */
export async function listStudentChatContacts(
  studentId: string,
): Promise<ChatContactOption[]> {
  const [enrollments, mentors] = await Promise.all([
    db.enrollment.findMany({
      where: {
        studentId,
        status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
      },
      select: {
        course: {
          select: {
            title: true,
            mentor: { select: { id: true, fullName: true, role: true } },
          },
        },
      },
    }),
    db.user.findMany({
      where: {
        role: UserRole.MENTOR,
        isActive: true,
        mentorProfileStatus: MentorProfileStatus.APPROVED,
      },
      orderBy: { fullName: "asc" },
      take: 40,
      select: { id: true, fullName: true, mentorHeadline: true },
    }),
  ]);

  const byId = new Map<string, ChatContactOption>();

  for (const e of enrollments) {
    const tutor = e.course.mentor;
    if (!tutor) continue;
    byId.set(tutor.id, {
      id: tutor.id,
      fullName: tutor.fullName,
      subtitle: `Tutor · ${e.course.title}`,
    });
  }

  for (const m of mentors) {
    if (byId.has(m.id)) continue;
    byId.set(m.id, {
      id: m.id,
      fullName: m.fullName,
      subtitle: m.mentorHeadline?.trim() || "Mentor",
    });
  }

  return [...byId.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
}

/** Unique enrolled students across a tutor's courses. */
export async function listTutorChatContacts(
  tutorId: string,
): Promise<ChatContactOption[]> {
  const courses = await db.course.findMany({
    where: { mentorId: tutorId },
    select: { id: true, title: true },
  });
  if (courses.length === 0) return [];

  const enrollments = await db.enrollment.findMany({
    where: {
      courseId: { in: courses.map((c) => c.id) },
      status: { in: [EnrollmentStatus.ACTIVE, EnrollmentStatus.COMPLETED] },
    },
    select: {
      student: { select: { id: true, fullName: true, email: true } },
      course: { select: { title: true } },
    },
    orderBy: { enrolledAt: "desc" },
  });

  const byId = new Map<string, ChatContactOption>();
  for (const e of enrollments) {
    if (byId.has(e.student.id)) continue;
    byId.set(e.student.id, {
      id: e.student.id,
      fullName: e.student.fullName,
      subtitle: e.course.title,
    });
  }

  return [...byId.values()].sort((a, b) =>
    a.fullName.localeCompare(b.fullName),
  );
}
