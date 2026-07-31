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
        Capture host must keep real layout size (never sr-only).
        Desktop: visible preview. Mobile: full-size off-screen host for html2canvas.
      */}
      <div
        className="max-sm:pointer-events-none max-sm:fixed max-sm:left-[-10000px] max-sm:top-0 max-sm:z-[-1] max-sm:w-[1056px] sm:relative sm:left-auto sm:top-auto sm:z-auto sm:w-auto"
        aria-hidden="true"
      >
        <CourseCertificateDocument data={data} />
      </div>

      {/* Mobile-only confirmation card */}
      <div className="mt-4 rounded-xl border border-[#00005C]/30 bg-[#00005C]/5 px-5 py-6 text-center sm:hidden">
        <p className="mb-2 text-2xl" aria-hidden>
          🎓
        </p>
        <p className="text-base font-semibold text-[#00005C]">
          Your certificate is ready!
        </p>
        <p className="mt-1 text-sm text-[#6b7280]">
          Download saves a PDF for{" "}
          <span className="font-medium text-[#1A1A2E]">
            {data.courseTitle}
          </span>
          . Use Print if download fails.
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
