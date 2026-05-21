import { EnrollmentStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { buildCertificateNumber } from "./certificate-number";

/** Idempotent: returns existing or newly issued certificate for a completed enrollment. */
export async function issueCertificateForEnrollment(
  enrollmentId: string,
): Promise<{ certificateNumber: string } | null> {
  const enrollment = await db.enrollment.findUnique({
    where: { id: enrollmentId },
    select: {
      id: true,
      status: true,
      completedAt: true,
      certificate: { select: { certificateNumber: true } },
    },
  });

  if (
    !enrollment ||
    enrollment.status !== EnrollmentStatus.COMPLETED ||
    !enrollment.completedAt
  ) {
    return null;
  }

  if (enrollment.certificate) {
    return { certificateNumber: enrollment.certificate.certificateNumber };
  }

  const issuedAt = enrollment.completedAt;
  const certificateNumber = buildCertificateNumber(enrollment.id, issuedAt);

  const created = await db.courseCertificate.create({
    data: {
      enrollmentId: enrollment.id,
      certificateNumber,
      issuedAt,
    },
    select: { certificateNumber: true },
  });

  return { certificateNumber: created.certificateNumber };
}
