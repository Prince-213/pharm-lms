import { redirect } from "next/navigation";

/** @deprecated Use /student/meetings/host/[hostId] — kept for bookmarks and old links. */
export default async function LegacyStudentMeetingsMentorRedirect({
  params,
  searchParams,
}: {
  params: Promise<{ mentorId: string }>;
  searchParams: Promise<{ courseId?: string }>;
}) {
  const { mentorId } = await params;
  const sp = await searchParams;
  const q = new URLSearchParams();
  if (sp.courseId) q.set("courseId", sp.courseId);
  const suffix = q.toString() ? `?${q.toString()}` : "";
  redirect(`/student/meetings/host/${mentorId}${suffix}`);
}
