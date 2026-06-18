"use client";

import { ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

async function downloadCertificateAsPdf(
  elementId: string,
  filename: string,
): Promise<void> {
  // Dynamic imports to avoid SSR issues
  const [html2canvas, { jsPDF }] = await Promise.all([
    import("html2canvas").then((m) => m.default),
    import("jspdf"),
  ]);

  const element = document.getElementById(elementId);
  if (!element) throw new Error("Certificate element not found");

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
  });

  const imgWidth = 297; // A4 landscape width in mm
  const imgHeight = 210; // A4 landscape height in mm

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const dataUrl = canvas.toDataURL("image/png", 1.0);
  pdf.addImage(dataUrl, "PNG", 0, 0, imgWidth, imgHeight);
  pdf.save(filename);
}

export function CourseCertificatePrintToolbar({
  courseId,
  studentName,
}: {
  courseId: string;
  studentName?: string;
}) {
  const [isDownloading, setIsDownloading] = useState(false);
  const [mobileDownloaded, setMobileDownloaded] = useState(false);
  const hasAutoDownloaded = useRef(false);

  const filename = `PharmLMS_Certificate${studentName ? `_${studentName.replace(/\s+/g, "_")}` : ""}.pdf`;

  async function handleDownload() {
    setIsDownloading(true);
    try {
      await downloadCertificateAsPdf("course-certificate", filename);
    } catch (err) {
      console.error("Certificate download failed:", err);
    } finally {
      setIsDownloading(false);
    }
  }

  // On mobile: auto-trigger download once on mount
  useEffect(() => {
    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 767px)").matches;

    if (isMobile && !hasAutoDownloaded.current) {
      hasAutoDownloaded.current = true;
      // Small delay so the certificate renders fully before capture
      const timer = setTimeout(async () => {
        setIsDownloading(true);
        try {
          await downloadCertificateAsPdf("course-certificate", filename);
          setMobileDownloaded(true);
        } catch (err) {
          console.error("Auto-download failed:", err);
        } finally {
          setIsDownloading(false);
        }
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [filename]);

  return (
    <div className="certificate-toolbar mb-6 flex flex-wrap items-center justify-between gap-3 print:hidden">
      <Link
        href={`/student/course/${courseId}`}
        className="inline-flex items-center gap-2 text-sm font-semibold text-[var(--primary)] hover:underline"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden />
        Back to course
      </Link>

      <div className="flex items-center gap-3">
        {/* Mobile: show status message */}
        <span className="block text-sm text-[#6b7280] sm:hidden">
          {isDownloading
            ? "Preparing your certificate…"
            : mobileDownloaded
              ? "Certificate downloaded ✓"
              : ""}
        </span>

        {/* Download button — always visible but labelled differently on mobile */}
        <button
          id="download-certificate-btn"
          type="button"
          onClick={handleDownload}
          disabled={isDownloading}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-strong)] disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isDownloading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              <span className="hidden sm:inline">Generating…</span>
              <span className="sm:hidden">Please wait…</span>
            </>
          ) : (
            <>
              <Download className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Download certificate</span>
              <span className="sm:hidden">Download again</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
