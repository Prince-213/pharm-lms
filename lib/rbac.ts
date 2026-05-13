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
  if (role === UserRole.TUTOR) return "/tutor/courses";
  if (role === UserRole.MENTOR) return "/mentor/dashboard";
  return "/student/dashboard";
}

/** Account profile editor (or home when no dedicated profile exists). */
export function profilePathForRole(role: UserRole) {
  if (role === UserRole.TUTOR) return "/tutor/profile";
  if (role === UserRole.MENTOR) return "/mentor/profile";
  if (role === UserRole.STUDENT) return "/student/profile";
  return "/admin/dashboard";
}
