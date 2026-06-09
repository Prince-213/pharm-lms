import { AuthPageShell } from "@/auth/auth-page-shell";
import { CrossSectorSessionGate } from "@/auth/cross-sector-session-gate";
import { LoginForm } from "@/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default async function MentorSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ authError?: string }>;
}) {
  const sp = await searchParams;
  const portalAuthError =
    sp.authError === "wrong_portal" ? ("wrong_portal" as const) : null;

  return (
    <AuthPageShell actorType="mentor" mode="signup">
      <CrossSectorSessionGate expectedRole={UserRole.MENTOR}>
        <LoginForm
          key="mentor-signup"
          actorType="mentor"
          mode="signup"
          callbackUrl="/mentor/dashboard"
          googleEnabled={isGoogleOAuthEnabled()}
          appleEnabled={isAppleOAuthEnabled()}
          portalAuthError={portalAuthError}
        />
      </CrossSectorSessionGate>
    </AuthPageShell>
  );
}
