import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function MentorSignupPage() {
  return (
    <AuthPageShell>
      <LoginForm
        actorType="tutor"
        mode="signup"
        callbackUrl="/tutor/performance"
        googleEnabled={isGoogleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}
