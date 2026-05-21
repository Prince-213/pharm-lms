"use client";

import { Award } from "lucide-react";
import type { CertificatePayload } from "@/lib/certificates/get-certificate-payload";

function formatCompletionDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CourseCertificateDocument({
  data,
}: {
  data: CertificatePayload;
}) {
  const completedLabel = formatCompletionDate(data.completedAt);

  return (
    <article
      id="course-certificate"
      className="certificate-sheet relative mx-auto aspect-[297/210] w-full max-w-[1056px] bg-white text-[#191c1d]"
      aria-label="Certificate of completion"
    >
      {/* Outer frame */}
      <div className="absolute inset-3 border-2 border-[#0f5238] sm:inset-4">
        <div className="absolute inset-2 border border-[#0f5238]/50" />
      </div>

      {/* Corner accents */}
      <span className="absolute left-3 top-3 h-5 w-5 border-l-2 border-t-2 border-[#0f5238] sm:left-4 sm:top-4" />
      <span className="absolute right-3 top-3 h-5 w-5 border-r-2 border-t-2 border-[#0f5238] sm:right-4 sm:top-4" />
      <span className="absolute bottom-3 left-3 h-5 w-5 border-b-2 border-l-2 border-[#0f5238] sm:bottom-4 sm:left-4" />
      <span className="absolute bottom-3 right-3 h-5 w-5 border-b-2 border-r-2 border-[#0f5238] sm:bottom-4 sm:right-4" />

      {/* Top-right seal */}
      <div
        className="absolute right-0 top-0 flex h-[72px] w-[200px] items-center justify-center bg-[#0f5238] sm:h-[88px] sm:w-[240px]"
        style={{
          clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
        }}
        aria-hidden
      >
        <div className="ml-8 flex h-14 w-14 items-center justify-center rounded-full border-2 border-white/90 bg-white shadow-sm sm:ml-10 sm:h-16 sm:w-16">
          <Award className="h-8 w-8 text-[#0f5238] sm:h-9 sm:w-9" strokeWidth={1.75} />
        </div>
      </div>

      <div className="relative flex h-full flex-col px-8 py-8 sm:px-12 sm:py-10">
        {/* Brand */}
        <header className="pr-[140px] sm:pr-[180px]">
          <p className="text-2xl font-bold tracking-tight sm:text-3xl">
            <span className="text-[#191c1d]">Pharm</span>
            <span className="text-[#0f5238]">LMS</span>
          </p>
          <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[#6b7280] sm:text-xs">
            Certificate of completion
          </p>
        </header>

        {/* Main */}
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <p className="text-xs font-medium uppercase tracking-wide text-[#6b7280] sm:text-sm">
            This certifies that
          </p>
          <h1 className="mt-2 max-w-[90%] text-3xl font-bold leading-tight text-[#0f5238] sm:text-5xl">
            {data.studentName}
          </h1>
          <p className="mt-4 max-w-xl text-sm text-[#404943] sm:text-base">
            For successfully completing{" "}
            <span className="font-semibold text-[#191c1d]">
              {data.hoursLabel}
            </span>{" "}
            of coursework
          </p>
          <p className="mt-5 max-w-2xl text-sm font-bold uppercase leading-snug tracking-wide text-[#191c1d] sm:text-lg">
            {data.courseTitle}
          </p>
        </div>

        {/* Footer */}
        <footer className="grid grid-cols-1 gap-8 border-t border-[#e5e7eb] pt-6 sm:grid-cols-3 sm:gap-6">
          <div className="text-center sm:text-left">
            <p
              className="font-serif text-2xl italic text-[#191c1d] sm:text-3xl"
              style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}
            >
              {data.instructorName}
            </p>
            <div className="mx-auto mt-2 h-px w-40 bg-[#191c1d] sm:mx-0" />
            <p className="mt-2 text-xs font-medium text-[#6b7280]">
              Course instructor
            </p>
          </div>

          <div className="text-center">
            <p className="text-lg font-bold text-[#191c1d] sm:text-xl">
              {completedLabel}
            </p>
            <div className="mx-auto mt-2 h-px w-36 bg-[#191c1d]" />
            <p className="mt-2 text-xs font-medium text-[#6b7280]">
              Date of completion
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="font-mono text-xs font-semibold text-[#404943] sm:text-sm">
              {data.certificateNumber}
            </p>
            <p className="mt-2 text-xs font-medium text-[#6b7280]">
              Certificate ID
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}
