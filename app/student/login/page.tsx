import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { CrossSectorSessionGate } from "@/components/auth/cross-sector-session-gate";
import { LoginForm } from "@/components/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; authError?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/student")
      ? raw
      : "/student/dashboard";
  const portalAuthError =
    sp.authError === "wrong_portal" ? ("wrong_portal" as const) : null;

  return (
    <AuthPageShell>
      <CrossSectorSessionGate expectedRole={UserRole.STUDENT}>
        <LoginForm
          key="student-login"
          actorType="student"
          mode="login"
          callbackUrl={callbackUrl}
          googleEnabled={isGoogleOAuthEnabled()}
          appleEnabled={isAppleOAuthEnabled()}
          portalAuthError={portalAuthError}
        />
      </CrossSectorSessionGate>
    </AuthPageShell>
  );
}
