import { notFound, redirect } from "next/navigation";
import { auth } from "@/auth";
import { CourseCertificateDocument } from "@/components/student/course-certificate-document";
import { CourseCertificatePrintToolbar } from "@/components/student/course-certificate-print-toolbar";
import { UserRole } from "@/generated/prisma/enums";
import { getCertificatePayloadForStudent } from "@/lib/certificates/get-certificate-payload";
import { issueCertificateForEnrollment } from "@/lib/certificates/issue-certificate";
import { db } from "@/lib/db";
import { studentMayAccessCourseContent } from "@/lib/payments/student-course-access";

export default async function CourseCertificatePage({
  params,
}: {
  params: Promise<{ courseId: string }>;
}) {
  const session = await auth();
  if (!session?.user) {
    redirect(
      `/student/login?callbackUrl=/student/course/${(await params).courseId}/certificate`,
    );
  }
  if (session.user.role !== UserRole.STUDENT) {
    redirect("/student/dashboard");
  }

  const { courseId } = await params;

  const enrollment = await db.enrollment.findUnique({
    where: {
      courseId_studentId: { courseId, studentId: session.user.id },
    },
    select: { id: true },
  });
  if (!enrollment) notFound();

  if (!(await studentMayAccessCourseContent(session.user.id, courseId))) {
    redirect(`/student/browse/${courseId}`);
  }

  await issueCertificateForEnrollment(enrollment.id);

  const data = await getCertificatePayloadForStudent(session.user.id, courseId);
  if (!data) notFound();

  return (
    <main className="certificate-page mx-auto max-w-[1100px] px-4 py-8 sm:px-6 sm:py-10">
      <CourseCertificatePrintToolbar courseId={courseId} />
      <CourseCertificateDocument data={data} />
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 12mm;
          }
          body {
            background: white !important;
          }
          .certificate-page {
            padding: 0 !important;
            max-width: none !important;
          }
          .certificate-toolbar {
            display: none !important;
          }
          .certificate-sheet {
            max-width: none !important;
            box-shadow: none !important;
          }
        }
      `}</style>
    </main>
  );
}
