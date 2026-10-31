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
import { parseUserRoleParam } from "@/lib/auth/wrong-portal";

export default async function TutorLoginPage({
  searchParams,
}: {
  searchParams: Promise<{
    callbackUrl?: string;
    authError?: string;
    error?: string;
    as?: string;
  }>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/tutor")
      ? raw
      : "/tutor/courses";

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
          portalAuthError={parsePortalAuthError(sp.authError)}
          authJsError={parseAuthJsError(sp.error)}
          actualAccountRole={parseUserRoleParam(sp.as)}
        />
      </CrossSectorSessionGate>
    </AuthPageShell>
  );
}
