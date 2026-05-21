"use client";

import { ArrowLeft, Printer } from "lucide-react";
import Link from "next/link";

export function CourseCertificatePrintToolbar({
  courseId,
}: {
  courseId: string;
}) {
  return (
    <div className="certificate-toolbar mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={`/student/course/${courseId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to course
      </Link>
      <button
        type="button"
        onClick={() => window.print()}
        className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-strong)]"
      >
        <Printer className="h-4 w-4" aria-hidden />
        Print certificate
      </button>
    </div>
  );
}
