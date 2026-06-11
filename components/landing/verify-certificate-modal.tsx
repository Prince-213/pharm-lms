"use client";

import { CheckCircle, Loader2, XCircle, X } from "lucide-react";

export type VerifyResult = {
  status: "valid" | "invalid" | null;
  certificateId?: string;
  courseName?: string;
  recipientName?: string;
  issuedDate?: string;
  message?: string;
};

type VerifyCertificateModalProps = {
  open: boolean;
  onClose: () => void;
  certificateId: string;
  status: "loading" | "done";
  result: VerifyResult;
};

export function VerifyCertificateModal({
  open,
  onClose,
  certificateId,
  status,
  result,
}: VerifyCertificateModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-[420px] rounded-[24px] bg-white px-6 py-8 shadow-2xl sm:px-8 sm:py-10">
        {/* Close button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-[#f0f0f0] text-[var(--muted-soft)] transition hover:bg-[#e0e0e0]"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        {status === "loading" ? (
          <div className="flex flex-col items-center py-6">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--emerald)]/10">
              <Loader2 className="h-8 w-8 animate-spin text-[var(--emerald)]" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-[var(--ink-deep)]">
              Verifying Certificate
            </h2>
            <p className="mt-2 text-sm text-[var(--muted-soft)]">
              Certificate ID: {certificateId}
            </p>
            <p className="mt-4 text-sm text-[var(--muted-soft)]">
              Please wait while we verify your certificate...
            </p>
          </div>
        ) : result.status === "valid" ? (
          <div className="flex flex-col items-center py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-green-700">
              Certificate Verified
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-soft)]">
              ID: {result.certificateId}
            </p>

            <div className="mt-6 w-full rounded-xl bg-[#f8f8f8] p-4 space-y-3">
              <div>
                <p className="text-xs text-[var(--muted-soft)]">Course</p>
                <p className="text-sm font-semibold text-[var(--ink-deep)]">
                  {result.courseName}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-soft)]">Recipient</p>
                <p className="text-sm font-semibold text-[var(--ink-deep)]">
                  {result.recipientName}
                </p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted-soft)]">Issued</p>
                <p className="text-sm font-semibold text-[var(--ink-deep)]">
                  {result.issuedDate}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[var(--emerald)] py-3 text-sm font-semibold text-white transition hover:bg-[var(--primary-strong)]"
            >
              Done
            </button>
          </div>
        ) : result.status === "invalid" ? (
          <div className="flex flex-col items-center py-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
            <h2 className="mt-5 font-display text-xl font-bold text-red-700">
              Invalid Certificate
            </h2>
            <p className="mt-1 text-sm text-[var(--muted-soft)]">
              ID: {certificateId}
            </p>
            <p className="mt-4 text-center text-sm text-[var(--muted-soft)]">
              {result.message ||
                "The certificate ID you entered could not be found in our system. Please check and try again."}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 w-full rounded-full bg-[#1a1a2e] py-3 text-sm font-semibold text-white transition hover:bg-[#2a2a3e]"
            >
              Try Again
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}
