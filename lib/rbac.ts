import { UserRole } from "@/generated/prisma/enums";

/**
 * Paths under `/mentor/*` that still point at the **tutor** app (historical URLs).
 * Must stay in sync with `next.config.ts` redirects to `/tutor/*`.
 * True mentor-only routes (`/mentor/dashboard`, `/mentor/calendar`, etc.) are NOT listed.
 */
const TUTOR_LEGACY_MENTOR_PREFIXES = [
  "/mentor/performance",
  "/mentor/courses",
  "/mentor/assignments",
  "/mentor/communication",
  "/mentor/students",
  "/mentor/chats",
  "/mentor/meetings/mentor",
] as const;

function normalizePathForRbac(path: string): string {
  const trimmed = path.replace(/\/$/, "");
  return trimmed.length === 0 ? "/" : trimmed;
}

/** Tutor users may load these `/mentor/...` URLs; they rewrite to `/tutor/...`. */
export function isTutorLegacyMentorAliasPath(path: string): boolean {
  const p = normalizePathForRbac(path);
  if (p === "/mentor") return true;
  return TUTOR_LEGACY_MENTOR_PREFIXES.some(
    (prefix) => p === prefix || p.startsWith(`${prefix}/`),
  );
}

export function canAccessRolePath(userRole: UserRole, path: string) {
  if (path.startsWith("/admin")) return userRole === UserRole.ADMIN;
  if (path.startsWith("/tutor")) return userRole === UserRole.TUTOR;
  if (path.startsWith("/mentor")) {
    if (userRole === UserRole.MENTOR) return true;
    if (userRole === UserRole.TUTOR && isTutorLegacyMentorAliasPath(path)) {
      return true;
    }
    return false;
  }
  if (path.startsWith("/student")) return userRole === UserRole.STUDENT;
  return true;
}

export function roleHomePath(role: UserRole) {
  if (role === UserRole.ADMIN) return "/admin/dashboard";
  if (role === UserRole.TUTOR) return "/tutor/performance";
  if (role === UserRole.MENTOR) return "/mentor/dashboard";
  return "/student/dashboard";
}
