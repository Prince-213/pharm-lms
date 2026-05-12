import { AuthPageShell } from "@/components/auth/auth-page-shell";
import { CrossSectorSessionGate } from "@/components/auth/cross-sector-session-gate";
import { LoginForm } from "@/components/auth/login-form";
import { UserRole } from "@/generated/prisma/enums";

export default function AdminLoginPage() {
  return (
    <AuthPageShell>
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
