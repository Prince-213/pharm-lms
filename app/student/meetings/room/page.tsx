import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { OpenMeetingRedirect } from "@/components/meetings/open-meeting-redirect";
import { UserRole } from "@/generated/prisma/enums";
import { assertAllowedJitsiJoinUrl } from "@/lib/meetings/join-url";
import { roleHomePath } from "@/lib/rbac";

export default async function StudentMeetingRoomPage({
  searchParams,
}: {
  searchParams: Promise<{ join?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/student/login?callbackUrl=/student/meetings");
  if (session.user.role !== UserRole.STUDENT)
    redirect(roleHomePath(session.user.role));

  const { join } = await searchParams;
  if (!join) redirect("/student/meetings");

  const safe = assertAllowedJitsiJoinUrl(join);
  if (!safe) redirect("/student/meetings");

  return <OpenMeetingRedirect url={safe} returnTo="/student/dashboard" />;
}
