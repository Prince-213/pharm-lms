import { AuthPageShell } from "@/auth/auth-page-shell";
import { CrossSectorSessionGate } from "@/auth/cross-sector-session-gate";
import { LoginForm } from "@/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";
import {
  parseAuthJsError,
  parsePortalAuthError,
} from "@/lib/auth/parse-auth-page-params";

export default async function MentorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    authError?: string;
    error?: string;
  }>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/mentor")
      ? raw
      : "/mentor/dashboard";

  return (
    <AuthPageShell actorType="mentor" mode="login">
      <CrossSectorSessionGate expectedRole={UserRole.MENTOR}>
        <LoginForm
          key="mentor-login"
          actorType="mentor"
          mode="login"
          callbackUrl={callbackUrl}
          googleEnabled={isGoogleOAuthEnabled()}
          appleEnabled={isAppleOAuthEnabled()}
          portalAuthError={parsePortalAuthError(sp.authError)}
          authJsError={parseAuthJsError(sp.error)}
        />
      </CrossSectorSessionGate>
    </AuthPageShell>
  );
}
