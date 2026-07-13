import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { CommunicationShell } from "@/components/mentor/communication-shell";
import { MeetingRequestStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { listThreadsForUser, countUnreadThreadsForUser } from "@/lib/chat";

export default async function MentorCommunicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user?.id) redirect("/tutor/login");

  const [pendingMeetings, messageBadge] = await Promise.all([
    db.meetingRequest.count({
      where: {
        mentorId: session.user.id,
        status: MeetingRequestStatus.PENDING,
      },
    }),
    countUnreadThreadsForUser(session.user.id),
  ]);

  return (
    <CommunicationShell
      messageBadge={messageBadge}
      meetingBadge={pendingMeetings}
    >
      {children}
    </CommunicationShell>
  );
}
