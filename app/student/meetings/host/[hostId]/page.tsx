import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { roleHomePath } from "@/lib/rbac";

/**
 * Legacy / convenience URL — canonical tutor profiles live at /student/tutors/[id],
 * mentors at /student/mentors/[id]. Preserves ?courseId= for booking context.
 */
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
  const q = courseId ? `?courseId=${encodeURIComponent(courseId)}` : "";

  const host = await db.user.findFirst({
    where: { id: hostId, isActive: true },
    select: { role: true },
  });
  if (!host) redirect("/student/meetings");

  if (host.role === UserRole.TUTOR) {
    redirect(`/student/tutors/${hostId}${q}`);
  }
  if (host.role === UserRole.MENTOR) {
    redirect(`/student/mentors/${hostId}${q}`);
  }

  redirect("/student/meetings");
}
