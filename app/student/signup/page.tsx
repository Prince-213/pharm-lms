import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function StudentSignupPage() {
  return (
    <AuthPageShell>
      <LoginForm
        key="student-signup"
        actorType="student"
        mode="signup"
        callbackUrl="/student/dashboard"
        googleEnabled={isGoogleOAuthEnabled()}
        appleEnabled={isAppleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}
