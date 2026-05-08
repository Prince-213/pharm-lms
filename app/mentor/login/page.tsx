import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function MentorLoginPage() {
  return (
    <AuthPageShell>
      <LoginForm
        actorType="mentor"
        mode="login"
        callbackUrl="/mentor/dashboard"
        googleEnabled={isGoogleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}

