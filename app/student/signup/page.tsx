import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function StudentSignupPage() {
  return (
    <AuthPageShell>
      <LoginForm
        actorType="student"
        mode="signup"
        callbackUrl="/student/dashboard"
        googleEnabled={isGoogleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}
