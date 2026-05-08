import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function MentorSignupPage() {
  return (
    <AuthPageShell>
      <LoginForm
        key="tutor-signup"
        actorType="tutor"
        mode="signup"
        callbackUrl="/tutor/performance"
        googleEnabled={isGoogleOAuthEnabled()}
        appleEnabled={isAppleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}
