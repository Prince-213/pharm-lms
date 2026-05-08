import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";
import { isGoogleOAuthEnabled } from "@/lib/auth/google-oauth-enabled";

export default async function StudentLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const sp = await searchParams;
  const raw = sp.callbackUrl;
  const callbackUrl =
    typeof raw === "string" && raw.startsWith("/student") ? raw : "/student/dashboard";

  return (
    <AuthPageShell>
      <LoginForm
        actorType="student"
        mode="login"
        callbackUrl={callbackUrl}
        googleEnabled={isGoogleOAuthEnabled()}
      />
    </AuthPageShell>
  );
}
