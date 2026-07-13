import { TutorPortalShell } from "@/app/tutor/tutor-portal-shell";

export const dynamic = "force-dynamic";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TutorPortalShell>{children}</TutorPortalShell>;
}
