import { CommunicationShell } from "@/components/mentor/communication-shell";

export default function MentorCommunicationLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <CommunicationShell>{children}</CommunicationShell>;
}
