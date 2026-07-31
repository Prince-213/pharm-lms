"use client";

import { ArrowLeft, Download, Loader2, Printer } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";

async function waitForCertificateReady(element: HTMLElement): Promise<void> {
  if (typeof document !== "undefined" && document.fonts?.ready) {
    try {
      await document.fonts.ready;
    } catch {
      // ignore font readiness failures
    }
  }

  const images = Array.from(element.querySelectorAll("img"));
  await Promise.all(
    images.map(async (img) => {
      if (img.complete && img.naturalWidth > 0) return;
      try {
        if (typeof img.decode === "function") {
          await img.decode();
          return;
        }
      } catch {
        // fall through to onload
      }
      if (img.complete) return;
      await new Promise<void>((resolve) => {
        const done = () => resolve();
        img.addEventListener("load", done, { once: true });
        img.addEventListener("error", done, { once: true });
      });
    }),
  );
}

async function waitForNonZeroWidth(
  elementId: string,
  attempts = 8,
): Promise<HTMLElement> {
  for (let i = 0; i < attempts; i++) {
    const element = document.getElementById(elementId);
    if (element) {
      const width = element.getBoundingClientRect().width;
      if (width > 8) return element;
    }
    await new Promise((r) => setTimeout(r, 150));
  }
  const element = document.getElementById(elementId);
  if (!element) throw new Error("Certificate element not found");
  if (element.getBoundingClientRect().width <= 8) {
    throw new Error("Certificate is not ready to capture yet");
  }
  return element;
}

async function downloadCertificateAsPdf(
  elementId: string,
  filename: string,
): Promise<void> {
  const [html2canvas, { jsPDF }] = await Promise.all([
    import("html2canvas").then((m) => m.default),
    import("jspdf"),
  ]);

  const element = await waitForNonZeroWidth(elementId);
  await waitForCertificateReady(element);

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    allowTaint: false,
    backgroundColor: "#ffffff",
    logging: false,
    width: element.scrollWidth || 1056,
    height: element.scrollHeight || undefined,
    windowWidth: Math.max(element.scrollWidth, 1056),
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
      toast.success("Certificate downloaded");
      setMobileDownloaded(true);
    } catch (err) {
      console.error("Certificate download failed:", err);
      toast.error(
        "Could not generate the PDF. Try Print instead, or tap Download again.",
      );
    } finally {
      setIsDownloading(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  // On mobile: auto-trigger download once the certificate has layout width
  useEffect(() => {
    const isMobile =
      /Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent) ||
      window.matchMedia("(max-width: 767px)").matches;

    if (isMobile && !hasAutoDownloaded.current) {
      hasAutoDownloaded.current = true;
      const timer = setTimeout(async () => {
        setIsDownloading(true);
        try {
          await downloadCertificateAsPdf("course-certificate", filename);
          setMobileDownloaded(true);
          toast.success("Certificate downloaded");
        } catch (err) {
          console.error("Auto-download failed:", err);
          toast.error(
            "Automatic download failed. Tap Download again, or use Print.",
          );
        } finally {
          setIsDownloading(false);
        }
      }, 600);
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
        <span className="block text-sm text-[#6b7280] sm:hidden">
          {isDownloading
            ? "Preparing your certificate…"
            : mobileDownloaded
              ? "Certificate downloaded ✓"
              : ""}
        </span>

        <button
          type="button"
          onClick={handlePrint}
          disabled={isDownloading}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] border border-[var(--border)] bg-white px-4 text-sm font-semibold text-[var(--foreground)] transition hover:bg-[var(--surface-muted)] disabled:opacity-70"
        >
          <Printer className="h-4 w-4" aria-hidden />
          <span className="hidden sm:inline">Print</span>
        </button>

        <button
          id="download-certificate-btn"
          type="button"
          onClick={() => void handleDownload()}
          disabled={isDownloading}
          className="inline-flex h-11 items-center gap-2 rounded-[var(--radius-md)] bg-[var(--primary)] px-5 text-sm font-bold text-white shadow-sm transition hover:bg-[var(--primary-strong)] disabled:cursor-not-allowed disabled:opacity-70"
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
              <span className="sm:hidden">
                {mobileDownloaded ? "Download again" : "Download"}
              </span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
