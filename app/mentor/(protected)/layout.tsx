import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { DashboardAppShell } from "@/components/layout/dashboard-app-shell";
import { mentorPortalConfig } from "@/components/layout/nav/portal-nav-config";
import { UserRole } from "@/generated/prisma/enums";
import { roleHomePath } from "@/lib/rbac";

export const dynamic = "force-dynamic";

export default async function MentorProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/mentor/login");
  if (session.user.role !== UserRole.MENTOR) {
    redirect(roleHomePath(session.user.role));
  }

  return (
    <DashboardAppShell config={mentorPortalConfig}>{children}</DashboardAppShell>
  );
}
