/**
 * Issue certificates for enrollments already marked COMPLETED.
 * Usage: pnpm dlx tsx scripts/backfill-course-certificates.ts
 *        pnpm dlx tsx scripts/backfill-course-certificates.ts --apply
 */
import { EnrollmentStatus } from "../generated/prisma/enums";
import { issueCertificateForEnrollment } from "../lib/certificates/issue-certificate";
import { prisma } from "../lib/prisma";

const apply = process.argv.includes("--apply");

async function main() {
  const rows = await prisma.enrollment.findMany({
    where: {
      status: EnrollmentStatus.COMPLETED,
      completedAt: { not: null },
      certificate: null,
    },
    select: { id: true, courseId: true, studentId: true },
  });

  console.log(`Found ${rows.length} completed enrollment(s) without a certificate.`);

  if (!apply) {
    console.log("Dry run. Pass --apply to issue certificates.");
    return;
  }

  let issued = 0;
  for (const row of rows) {
    const result = await issueCertificateForEnrollment(row.id);
    if (result) issued += 1;
  }
  console.log(`Issued ${issued} certificate(s).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
