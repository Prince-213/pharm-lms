import { StudentPortalShell } from "@/app/student/student-portal-shell";

export const dynamic = "force-dynamic";

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <StudentPortalShell>{children}</StudentPortalShell>;
}
