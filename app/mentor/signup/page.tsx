import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function MentorSignupPage() {
  return (
    <AuthPageShell>
      <LoginForm
        actorType="mentor"
        mode="signup"
        callbackUrl="/mentor/profile"
        googleEnabled={isGoogleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}

