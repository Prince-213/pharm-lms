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

export default async function StudentLoginPage({
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
    typeof raw === "string" &&
    (raw.startsWith("/student") || raw.startsWith("/courses"))
      ? raw
      : "/student/dashboard";

  return (
    <AuthPageShell actorType="student" mode="login">
      <CrossSectorSessionGate expectedRole={UserRole.STUDENT}>
        <LoginForm
          key="student-login"
          actorType="student"
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
