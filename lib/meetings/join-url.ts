import { normalizeJitsiHost } from "@/lib/meetings/jitsi";

function canonicalHost(hostname: string): string {
  return hostname.toLowerCase().replace(/^www\./, "");
}

/**
 * Ensures a meeting join URL points at the configured Jitsi host (mitigates open redirects).
 */
export function assertAllowedJitsiJoinUrl(raw: string): string | null {
  let parsed: URL;
  try {
    parsed = new URL(raw);
  } catch {
    return null;
  }
  if (parsed.protocol !== "https:") return null;
  const trusted = canonicalHost(normalizeJitsiHost(process.env.JITSI_DOMAIN));
  if (canonicalHost(parsed.hostname) !== trusted) return null;
  return parsed.toString();
}
