import { UserRole } from "@/generated/prisma/enums";
import { loginPathForRole } from "@/lib/rbac";
import { userRoleLabel } from "@/lib/user-role-label";

export function parseUserRoleParam(
  value: string | undefined | null,
): UserRole | null {
  if (!value) return null;
  const normalized = value.trim().toUpperCase();
  if (normalized === UserRole.STUDENT) return UserRole.STUDENT;
  if (normalized === UserRole.TUTOR) return UserRole.TUTOR;
  if (normalized === UserRole.MENTOR) return UserRole.MENTOR;
  if (normalized === UserRole.ADMIN) return UserRole.ADMIN;
  return null;
}

export function parseWrongPortalCode(
  code: string | undefined | null,
): UserRole | null {
  if (!code) return null;
  const match = code
    .trim()
    .toUpperCase()
    .match(/^WRONG_PORTAL(?:_(STUDENT|TUTOR|MENTOR|ADMIN))?$/);
  if (!match) return null;
  return parseUserRoleParam(match[1]);
}

export function wrongPortalErrorMessage(attemptedLabel: string | null) {
  if (!attemptedLabel) return "This account is not registered for this portal.";
  if (attemptedLabel.toLowerCase() === "admin") {
    return "This account does not have admin access.";
  }
  return `This account is not registered as a ${attemptedLabel.toLowerCase()}.`;
}

export function wrongPortalActionCopy(actualRole: UserRole) {
  const label = userRoleLabel(actualRole);
  return {
    message: `Log in as ${label} instead`,
    actionLabel: `${label} login`,
    href: loginPathForRole(actualRole),
  };
}
