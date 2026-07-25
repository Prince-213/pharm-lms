import { AdminAuthPageShell } from "@/auth/admin-auth-page-shell";
import { CrossSectorSessionGate } from "@/auth/cross-sector-session-gate";
import { LoginForm } from "@/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";
import {
  parseAuthJsError,
  parsePortalAuthError,
} from "@/lib/auth/parse-auth-page-params";

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string; error?: string }>;
}) {
  const sp = await searchParams;

  return (
    <AdminAuthPageShell>
      <CrossSectorSessionGate expectedRole={UserRole.ADMIN}>
        <LoginForm
          actorType="admin"
          mode="login"
          callbackUrl="/admin/dashboard"
          googleEnabled={false}
          portalAuthError={parsePortalAuthError(sp.authError)}
          authJsError={parseAuthJsError(sp.error)}
        />
      </CrossSectorSessionGate>
    </AdminAuthPageShell>
  );
}
