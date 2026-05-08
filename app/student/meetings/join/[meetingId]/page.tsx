import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { OpenMeetingRedirect } from "@/components/meetings/open-meeting-redirect";
import { UserRole } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { buildJitsiJoinUrl } from "@/lib/meetings/jitsi";
import { assertAllowedJitsiJoinUrl } from "@/lib/meetings/join-url";
import { isMeetingJoinable } from "@/lib/meetings/meeting-joinable";
import { reconcileStaleMeetings } from "@/lib/meetings/reconcile-stale-meetings";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentMeetingJoinPage({
  params,
}: {
  params: Promise<{ meetingId: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/meetings");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { meetingId } = await params;

  await reconcileStaleMeetings();

  const meeting = await db.meeting.findFirst({
    where: { id: meetingId, studentId: session.user.id },
    select: {
      id: true,
      joinUrl: true,
      roomName: true,
      status: true,
      startsAt: true,
      endsAt: true,
      openedAt: true,
    },
  });
  if (!meeting) notFound();
  if (!isMeetingJoinable(meeting)) notFound();

  let safe = assertAllowedJitsiJoinUrl(meeting.joinUrl);
  if (!safe)
    safe = assertAllowedJitsiJoinUrl(buildJitsiJoinUrl(meeting.roomName));
  if (!safe) notFound();

  await db.meeting.updateMany({
    where: { id: meeting.id, openedAt: null },
    data: { openedAt: new Date() },
  });

  return <OpenMeetingRedirect url={safe} returnTo="/student/dashboard" />;
}
