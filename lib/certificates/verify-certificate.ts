"use server";

import { db } from "@/lib/db";

export type VerifiedCertificate = {
  certificateNumber: string;
  holderName: string;
  courseTitle: string;
  issuedAt: string;
};

export async function verifyCertificate(
  id: string,
): Promise<VerifiedCertificate | null> {
  const certificateNumber = id.trim();
  if (!certificateNumber) return null;

  const record = await db.courseCertificate.findUnique({
    where: { certificateNumber },
    select: {
      certificateNumber: true,
      issuedAt: true,
      enrollment: {
        select: {
          student: { select: { fullName: true } },
          course: { select: { title: true } },
        },
      },
    },
  });

  if (!record) return null;

  return {
    certificateNumber: record.certificateNumber,
    holderName: record.enrollment.student.fullName,
    courseTitle: record.enrollment.course.title,
    issuedAt: record.issuedAt.toISOString(),
  };
}
