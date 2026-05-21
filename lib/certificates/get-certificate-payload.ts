import { EnrollmentStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { formatCertificateHours } from "./format-certificate-hours";

export type CertificatePayload = {
  certificateNumber: string;
  studentName: string;
  courseTitle: string;
  hoursLabel: string;
  instructorName: string;
  completedAt: Date;
  courseId: string;
};

export async function getCertificatePayloadForStudent(
  studentId: string,
  courseId: string,
): Promise<CertificatePayload | null> {
  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId },
    },
    include: {
      certificate: true,
      course: {
        include: {
          mentor: { select: { fullName: true } },
          sections: {
            orderBy: { position: "asc" },
            include: {
              lessons: {
                orderBy: { position: "asc" },
                select: {
                  durationSec: true,
                  content: true,
                  videoUrl: true,
                },
              },
            },
          },
        },
      },
      student: { select: { fullName: true } },
    },
  });

  if (
    !enrollment ||
    enrollment.status !== EnrollmentStatus.COMPLETED ||
    !enrollment.completedAt ||
    !enrollment.certificate
  ) {
    return null;
  }

  const hoursLabel = formatCertificateHours(
    enrollment.course.estimatedDurationMinutes,
    enrollment.course.sections,
  );

  return {
    certificateNumber: enrollment.certificate.certificateNumber,
    studentName: enrollment.student.fullName,
    courseTitle: enrollment.course.title,
    hoursLabel,
    instructorName: enrollment.course.mentor.fullName,
    completedAt: enrollment.completedAt,
    courseId,
  };
}
