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
      className="certificate-sheet relative mx-auto w-full max-w-[1056px] overflow-hidden bg-white text-[#191c1d] max-sm:min-h-[32rem] max-sm:rounded-lg max-sm:shadow-[var(--shadow-md)] sm:aspect-[297/210]"
      aria-label="Certificate of completion"
    >
      {/* Outer frame */}
      <div className="pointer-events-none absolute inset-2 border-2 border-[#00005C] sm:inset-4">
        <div className="absolute inset-1.5 border border-[#00005C]/30 sm:inset-2" />
      </div>

      {/* Corner accents */}
      <span className="pointer-events-none absolute left-2 top-2 h-4 w-4 border-l-2 border-t-2 border-[#00005C] sm:left-4 sm:top-4 sm:h-5 sm:w-5" />
      <span className="pointer-events-none absolute right-2 top-2 h-4 w-4 border-r-2 border-t-2 border-[#00005C] sm:right-4 sm:top-4 sm:h-5 sm:w-5" />
      <span className="pointer-events-none absolute bottom-2 left-2 h-4 w-4 border-b-2 border-l-2 border-[#00005C] sm:bottom-4 sm:left-4 sm:h-5 sm:w-5" />
      <span className="pointer-events-none absolute bottom-2 right-2 h-4 w-4 border-b-2 border-r-2 border-[#00005C] sm:bottom-4 sm:right-4 sm:h-5 sm:w-5" />

      {/* Top-right seal */}
      <div
        className="pointer-events-none absolute right-0 top-0 flex h-14 w-[7.5rem] items-center justify-center bg-[#00005C] sm:h-[88px] sm:w-[240px]"
        style={{
          clipPath: "polygon(12% 0, 100% 0, 100% 100%, 0 100%)",
        }}
        aria-hidden
      >
        <div className="ml-5 flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/90 bg-white shadow-sm sm:ml-10 sm:h-16 sm:w-16">
          <Award
            className="h-5 w-5 text-[#3D5AFE] sm:h-9 sm:w-9"
            strokeWidth={1.75}
          />
        </div>
      </div>

      {/* Content — padded inside border; min-h-0 prevents flex overflow */}
      <div className="relative box-border flex min-h-[32rem] flex-col px-4 py-5 sm:min-h-0 sm:h-full sm:px-12 sm:py-10">
        <header className="shrink-0 pr-[6.5rem] sm:pr-[180px]">
          <p className="text-lg font-bold tracking-tight sm:text-3xl">
            <span className="text-[#1A1A2E]">Pharm</span>
            <span className="text-[#3D5AFE]">LMS</span>
          </p>
          <p className="mt-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-[#6b7280] sm:mt-1 sm:text-xs sm:tracking-[0.2em]">
            Certificate of completion
          </p>
        </header>

        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-1 py-4 text-center sm:px-0 sm:py-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-[#6b7280] sm:text-sm">
            This certifies that
          </p>
          <h1 className="mt-1.5 w-full break-words text-xl font-bold leading-tight text-[#3D5AFE] sm:mt-2 sm:max-w-[90%] sm:text-5xl">
            {data.studentName}
          </h1>
          <p className="mt-3 w-full max-w-xl text-xs leading-relaxed text-[#404943] sm:mt-4 sm:text-base">
            For successfully completing{" "}
            <span className="font-semibold text-[#1A1A2E]">
              {data.hoursLabel}
            </span>{" "}
            of coursework
          </p>
          <p className="mt-3 w-full break-words text-[11px] font-bold uppercase leading-snug tracking-wide text-[#1A1A2E] sm:mt-5 sm:max-w-2xl sm:text-lg">
            {data.courseTitle}
          </p>
        </div>

        <footer className="shrink-0 grid grid-cols-1 gap-5 border-t border-[#e5e7eb] pt-4 sm:grid-cols-3 sm:gap-6 sm:pt-6">
          {/* PharmAnalytics signature */}
          <div className="text-center sm:text-left">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/assets/certificate_signature.png"
              alt="Signature"
              className="mb-1 h-10 w-auto max-w-[8rem] object-contain mx-auto sm:mx-0 sm:h-12 sm:max-w-[10rem]"
              crossOrigin="anonymous"
            />
            <div className="mx-auto mt-1.5 h-px w-28 bg-[#1A1A2E] sm:mx-0 sm:mt-2 sm:w-36" />
            <p className="mt-1.5 text-[10px] font-medium text-[#6b7280] sm:mt-2 sm:text-xs">
              PharmAnalytics Team
            </p>
          </div>

          <div className="text-center">
            <p className="text-base font-bold text-[#1A1A2E] sm:text-xl">
              {completedLabel}
            </p>
            <div className="mx-auto mt-1.5 h-px w-28 bg-[#1A1A2E] sm:mt-2 sm:w-36" />
            <p className="mt-1.5 text-[10px] font-medium text-[#6b7280] sm:mt-2 sm:text-xs">
              Date of completion
            </p>
          </div>

          <div className="text-center sm:text-right">
            <p className="break-all font-mono text-[10px] font-semibold leading-snug text-[#404943] sm:text-sm">
              {data.certificateNumber}
            </p>
            <p className="mt-1.5 text-[10px] font-medium text-[#6b7280] sm:mt-2 sm:text-xs">
              Certificate ID
            </p>
          </div>
        </footer>
      </div>
    </article>
  );
}
