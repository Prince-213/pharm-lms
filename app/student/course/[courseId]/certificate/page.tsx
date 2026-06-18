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
    <main className="certificate-page mx-auto max-w-[1100px] overflow-x-hidden px-3 py-6 sm:px-6 sm:py-10">
      <CourseCertificatePrintToolbar
        courseId={courseId}
        studentName={data.studentName}
      />

      {/*
        Desktop: show preview + download button.
        Mobile: render the certificate off-screen so html2canvas can capture it,
        but hide it visually — the toolbar auto-triggers the download on mount.
      */}
      <div className="sm:block max-sm:sr-only" aria-hidden="true">
        <CourseCertificateDocument data={data} />
      </div>

      {/* Mobile-only confirmation card shown after auto-download */}
      <div className="sm:hidden mt-4 rounded-xl border border-[#00005C]/30 bg-[#00005C]/5 px-5 py-6 text-center">
        <p className="text-2xl mb-2">🎓</p>
        <p className="font-semibold text-[#00005C] text-base">
          Your certificate is ready!
        </p>
        <p className="mt-1 text-sm text-[#6b7280]">
          Check your downloads folder for{" "}
          <span className="font-medium text-[#1A1A2E]">
            {data.courseTitle}
          </span>
          .
        </p>
        <p className="mt-2 text-xs text-[#9ca3af]">
          Use the button above if you need to download again.
        </p>
      </div>

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
            aspect-ratio: 297 / 210 !important;
            min-height: auto !important;
          }
        }
      `}</style>
    </main>
  );
}
