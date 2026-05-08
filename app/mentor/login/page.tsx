import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isAppleOAuthEnabled } from "@/lib/auth/apple-oauth-enabled";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default function MentorLoginPage() {
  return (
    <AuthPageShell>
      <LoginForm
        key="mentor-login"
        actorType="mentor"
        mode="login"
        callbackUrl="/mentor/dashboard"
        googleEnabled={isGoogleOAuthEnabled()}
        appleEnabled={isAppleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}

