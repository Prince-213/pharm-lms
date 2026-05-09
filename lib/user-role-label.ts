import { UserRole } from "@/generated/prisma/enums";

export function userRoleLabel(role: UserRole | undefined | null): string {
  if (!role) return "Member";
  switch (role) {
    case UserRole.ADMIN:
      return "Admin";
    case UserRole.TUTOR:
      return "Tutor";
    case UserRole.MENTOR:
      return "Mentor";
    case UserRole.STUDENT:
      return "Student";
    default:
      return role;
  }
}
