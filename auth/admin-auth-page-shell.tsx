import Link from "next/link";
import { AuthLayoutShell } from "@/auth/auth-layout-shell";
import { portalAuthCopy } from "@/lib/auth/portal-auth-copy";

export function AdminAuthPageShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthLayoutShell
      quote="Secure admin access keeps course quality high and mentor applications reviewed — everything in one platform workspace."
      author="PharmLMS Admin"
      portalLabel={portalAuthCopy.admin.sidebarTitle}
      sidebarFooter={
        <Link
          href="/student/login"
          className="text-sm font-medium text-[var(--accent)] underline-offset-2 hover:underline"
        >
          ← Back to student login
        </Link>
      }
    >
      {children}
    </AuthLayoutShell>
  );
}
