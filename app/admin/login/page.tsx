import { AuthPageShell } from "@/auth/auth-page-shell";
import { CrossSectorSessionGate } from "@/auth/cross-sector-session-gate";
import { LoginForm } from "@/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";

export default function AdminLoginPage() {
  return (
    <AuthPageShell actorType="student" mode="login">
      <CrossSectorSessionGate expectedRole={UserRole.ADMIN}>
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
      </CrossSectorSessionGate>
    </AuthPageShell>
  );
}
