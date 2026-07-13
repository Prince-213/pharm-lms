"use client";

import {
  AlertCircle,
  BadgeCheck,
  CheckCircle2,
  Loader2,
  X,
} from "lucide-react";
import { useCallback, useEffect, useState, useTransition } from "react";
import { createPortal } from "react-dom";
import {
  verifyCertificate,
  type VerifiedCertificate,
} from "@/lib/certificates/verify-certificate";
import { cn } from "@/lib/utils";

type VerifyResult =
  | { status: "idle" }
  | { status: "success"; certificate: VerifiedCertificate }
  | { status: "error" };

function formatIssueDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

type VerifyCertificateDialogProps = {
  className?: string;
  /** `nav` matches landing navbar links; `page` is the underlined catalogue CTA. */
  triggerVariant?: "page" | "nav";
};

export function VerifyCertificateDialog({
  className,
  triggerVariant = "page",
}: VerifyCertificateDialogProps) {
  const [open, setOpen] = useState(false);
  const [certificateId, setCertificateId] = useState("");
  const [result, setResult] = useState<VerifyResult>({ status: "idle" });
  const [pending, startTransition] = useTransition();

  const resetForm = useCallback(() => {
    setCertificateId("");
    setResult({ status: "idle" });
  }, []);

  const close = useCallback(() => {
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) {
      const timer = window.setTimeout(resetForm, 200);
      return () => window.clearTimeout(timer);
    }
    return undefined;
  }, [open, resetForm]);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") close();
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const id = certificateId.trim();
    if (!id || pending) return;

    startTransition(async () => {
      const certificate = await verifyCertificate(id);
      if (certificate) {
        setResult({ status: "success", certificate });
      } else {
        setResult({ status: "error" });
      }
    });
  }

  const triggerClassName =
    triggerVariant === "nav"
      ? "text-sm text-slate-700 transition-colors hover:text-[var(--emerald)]"
      : "inline-flex items-center gap-1.5 text-sm font-medium text-[var(--emerald)] underline decoration-1 underline-offset-4 transition-colors hover:text-[var(--primary)]";

  const modal =
    open && typeof document !== "undefined" ? (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6"
          role="presentation"
        >
          <button
            type="button"
            aria-label="Close dialog"
            onClick={close}
            className={cn(
              "absolute inset-0 cursor-default bg-slate-900/30 backdrop-blur-[2px]",
              "animate-in fade-in-0 duration-200",
            )}
          />

          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="verify-certificate-title"
            aria-describedby="verify-certificate-desc"
            className={cn(
              "relative w-full max-w-[400px] rounded-xl border border-slate-200/80 bg-white p-6 shadow-xl",
              "animate-in fade-in-0 zoom-in-95 duration-200",
            )}
          >
            <button
              type="button"
              onClick={close}
              aria-label="Close"
              className="absolute right-4 top-4 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emerald)]/40"
            >
              <X className="h-4 w-4" strokeWidth={1.75} />
            </button>

            <header className="pr-8">
              <h2
                id="verify-certificate-title"
                className="font-display text-lg font-semibold tracking-tight text-[var(--ink-deep)]"
              >
                Verify Certificate
              </h2>
              <p
                id="verify-certificate-desc"
                className="mt-1.5 text-sm leading-relaxed text-slate-500"
              >
                Enter your certificate ID to confirm its authenticity.
              </p>
            </header>

            <form onSubmit={onSubmit} className="mt-6 space-y-4">
              <div>
                <label htmlFor="certificate-id" className="sr-only">
                  Certificate ID
                </label>
                <input
                  id="certificate-id"
                  type="text"
                  value={certificateId}
                  onChange={(e) => {
                    setCertificateId(e.target.value);
                    if (result.status !== "idle") {
                      setResult({ status: "idle" });
                    }
                  }}
                  placeholder="Certificate ID"
                  autoComplete="off"
                  disabled={pending}
                  className={cn(
                    "h-11 w-full rounded-lg border border-slate-200 bg-white px-3.5 text-sm text-[var(--ink-deep)] outline-none transition-shadow",
                    "placeholder:text-slate-400",
                    "focus-visible:border-[var(--emerald)] focus-visible:ring-2 focus-visible:ring-[var(--emerald)]/25",
                    "disabled:cursor-not-allowed disabled:opacity-60",
                  )}
                />
              </div>

              <button
                type="submit"
                disabled={pending || !certificateId.trim()}
                className={cn(
                  "inline-flex h-11 w-full items-center justify-center gap-2 rounded-lg text-sm font-semibold text-white transition-colors",
                  "bg-[var(--emerald)] hover:bg-[var(--primary)]",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--emerald)]/40 focus-visible:ring-offset-2",
                  "disabled:pointer-events-none disabled:opacity-60",
                )}
              >
                {pending ? (
                  <>
                    <Loader2
                      className="h-4 w-4 animate-spin"
                      strokeWidth={2}
                      aria-hidden
                    />
                    Verifying…
                  </>
                ) : (
                  "Verify"
                )}
              </button>

              {result.status === "success" ? (
                <div
                  className="rounded-lg border border-emerald-100 bg-emerald-50/60 px-4 py-3"
                  role="status"
                >
                  <div className="flex gap-2.5">
                    <CheckCircle2
                      className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600"
                      strokeWidth={1.75}
                      aria-hidden
                    />
                    <div className="min-w-0 space-y-1">
                      <p className="text-sm font-semibold text-emerald-600">
                        Valid certificate
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="text-slate-500">Course </span>
                        {result.certificate.courseTitle}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="text-slate-500">Issued to </span>
                        {result.certificate.holderName}
                      </p>
                      <p className="text-sm text-slate-600">
                        <span className="text-slate-500">Issue date </span>
                        {formatIssueDate(result.certificate.issuedAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}

              {result.status === "error" ? (
                <div
                  className="flex gap-2.5 rounded-lg border border-red-100 bg-red-50/50 px-4 py-3"
                  role="alert"
                >
                  <AlertCircle
                    className="mt-0.5 h-5 w-5 shrink-0 text-red-500"
                    strokeWidth={1.75}
                    aria-hidden
                  />
                  <p className="text-sm text-red-500">
                    Invalid certificate ID. Please check and try again.
                  </p>
                </div>
              ) : null}
            </form>
          </div>
        </div>
    ) : null;

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(triggerClassName, className)}
      >
        {triggerVariant === "page" ? (
          <BadgeCheck className="h-4 w-4 shrink-0" strokeWidth={1.75} />
        ) : null}
        Verify Certificate
      </button>

      {modal ? createPortal(modal, document.body) : null}
    </>
  );
}
