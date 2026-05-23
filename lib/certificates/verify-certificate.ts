"use server";

import { db } from "@/lib/db";

export type VerifiedCertificate = {
  certificateNumber: string;
  holderName: string;
  issuedAt: string;
};

const DEMO_CERTIFICATES: Record<string, VerifiedCertificate> = {
  "PHARM-2024-001": {
    certificateNumber: "PHARM-2024-001",
    holderName: "Ada Okafor",
    issuedAt: "2024-11-14T00:00:00.000Z",
  },
  "DEMO-VALID": {
    certificateNumber: "DEMO-VALID",
    holderName: "Sample Graduate",
    issuedAt: "2025-03-01T00:00:00.000Z",
  },
};

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export async function verifyCertificate(
  id: string,
): Promise<VerifiedCertificate | null> {
  const certificateNumber = id.trim();
  if (!certificateNumber) return null;

  await delay(1000 + Math.floor(Math.random() * 1000));

  const demo =
    DEMO_CERTIFICATES[certificateNumber.toUpperCase()] ??
    DEMO_CERTIFICATES[certificateNumber];
  if (demo) return demo;

  const record = await db.courseCertificate.findUnique({
    where: { certificateNumber },
    select: {
      certificateNumber: true,
      issuedAt: true,
      enrollment: {
        select: {
          student: { select: { fullName: true } },
        },
      },
    },
  });

  if (!record) return null;

  return {
    certificateNumber: record.certificateNumber,
    holderName: record.enrollment.student.fullName,
    issuedAt: record.issuedAt.toISOString(),
  };
}
