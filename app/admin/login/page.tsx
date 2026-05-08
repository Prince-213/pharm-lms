import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { LoginForm } from "@/components/auth/login-form";

export default function AdminLoginPage() {
  return (
    <AuthPageShell>
      <LoginForm
        actorType="admin"
        mode="login"
        callbackUrl="/admin/dashboard"
        googleEnabled={false}
        adminCredentialHints={{
          email: "admin@pharmlms.com",
          password: "ChangeMe123!",
        }}
      />
    </AuthPageShell>
  );
}
