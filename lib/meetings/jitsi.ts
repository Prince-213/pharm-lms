/**
 * Hostname only (no protocol/path). Accepts env values like `meet.jit.si` or `https://meet.jit.si`.
 */
export function normalizeJitsiHost(raw?: string | null): string {
  const s = (raw ?? "meet.jit.si").trim();
  if (!s) return "meet.jit.si";
  if (s.includes("://")) {
    try {
      return new URL(s).hostname.toLowerCase();
    } catch {
      return "meet.jit.si";
    }
  }
  return s.split("/")[0]?.split(":")[0]?.toLowerCase() || "meet.jit.si";
}

export function buildJitsiRoomName(
  courseId: string,
  mentorId: string,
  studentId: string,
) {
  return `pharm-lms-${courseId}-${mentorId}-${studentId}`.toLowerCase();
}

export function buildJitsiJoinUrl(roomName: string) {
  const host = normalizeJitsiHost(process.env.JITSI_DOMAIN);
  const room = roomName.replace(/^\/+/, "");
  return `https://${host}/${room}`;
}
