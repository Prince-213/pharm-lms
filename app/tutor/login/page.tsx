import { AuthPageShell } from "@/auth/auth-page-shell";
import { CrossSectorSessionGate } from "@/auth/cross-sector-session-gate";
import { LoginForm } from "@/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default async function TutorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string; authError?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/tutor")
      ? raw
      : "/tutor/courses";
  const portalAuthError =
    sp.authError === "wrong_portal"
      ? ("wrong_portal" as const)
      : sp.authError === "account_disabled"
        ? ("account_disabled" as const)
        : null;

  return (
    <AuthPageShell actorType="tutor" mode="login">
      <CrossSectorSessionGate expectedRole={UserRole.TUTOR}>
        <LoginForm
          key="tutor-login"
          actorType="tutor"
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
