import { UserRole } from "@/generated/prisma/enums";

export function canAccessRolePath(userRole: UserRole, path: string) {
  if (path.startsWith("/admin")) return userRole === UserRole.ADMIN;
  if (path.startsWith("/tutor")) return userRole === UserRole.TUTOR;
  if (path.startsWith("/mentor")) return userRole === UserRole.MENTOR;
  if (path.startsWith("/student")) return userRole === UserRole.STUDENT;
  return true;
}

export function roleHomePath(role: UserRole) {
  if (role === UserRole.ADMIN) return "/admin/dashboard";
  if (role === UserRole.TUTOR) return "/tutor/performance";
  if (role === UserRole.MENTOR) return "/mentor/dashboard";
  return "/student/dashboard";
}
