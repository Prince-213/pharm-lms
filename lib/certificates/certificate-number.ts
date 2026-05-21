import { createHash } from "node:crypto";

/** Stable display ID, e.g. PHARM-2026-A1B2C3D4 */
export function buildCertificateNumber(
  enrollmentId: string,
  issuedAt: Date,
): string {
  const year = issuedAt.getUTCFullYear();
  const digest = createHash("sha256")
    .update(enrollmentId)
    .digest("hex")
    .slice(0, 8)
    .toUpperCase();
  return `PHARM-${year}-${digest}`;
}
