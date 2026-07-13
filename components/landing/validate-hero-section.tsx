"use client";

import { useState, useTransition } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import {
  VerifyCertificateModal,
  type VerifyResult,
} from "@/components/landing/verify-certificate-modal";
import { verifyCertificate } from "@/lib/certificates/verify-certificate";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

function formatIssueDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function ValidateHeroSection() {
  const [certId, setCertId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"loading" | "done">("loading");
  const [result, setResult] = useState<VerifyResult>({ status: null });
  const [pending, startTransition] = useTransition();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const id = certId.trim();
    if (!id || pending) return;

    setModalOpen(true);
    setVerifyStatus("loading");
    setResult({ status: null });

    startTransition(async () => {
      const certificate = await verifyCertificate(id);
      if (certificate) {
        setResult({
          status: "valid",
          certificateId: certificate.certificateNumber,
          courseName: certificate.courseTitle,
          recipientName: certificate.holderName,
          issuedDate: formatIssueDate(certificate.issuedAt),
        });
      } else {
        setResult({
          status: "invalid",
          message:
            "The certificate ID you entered could not be found in our system. Please check and try again.",
        });
      }
      setVerifyStatus("done");
    });
  };

  return (
    <>
      <div className="gap-y-8 lg:w-[79%] xl:w-[60%] mx-auto py-12 lg:py-[6rem] flex flex-col items-center justify-center px-4">
        <div className="text-base font-medium text-[#5A536C] py-[2px] px-[11px] rounded-lg border border-[var(--border)]">
          <p>100% Quality Courses</p>
        </div>
        <h1 className="text-center font-display text-[36px] font-bold leading-[1.15] text-[var(--ink-deep)] sm:text-[48px] lg:text-[64px]">
          <span className="inline-flex items-center gap-3 flex-wrap justify-center">
            Validate
            <span className="relative">
              <img
                src="/assets/online.png"
                alt=""
                className="inline-block h-10 w-auto sm:h-14 lg:h-20 absolute left-0 -z-0"
                aria-hidden="true"
              />
              <p className="z-50 relative text-white ">your</p>
            </span>

            <span className="relative inline-block">
              Certificate
              <img
                src="/assets/underline.png"
                alt=""
                className="absolute -bottom-8 left-0 w-full h-14 object-contain"
                aria-hidden="true"
              />
            </span>
          </span>
          <br />
          <span className="mt-2 block">& Verify your Status</span>
        </h1>
        <form onSubmit={handleVerify} className="w-[90%] sm:w-[80%] mx-auto">
          <div className="w-full h-fit flex items-center gap-3 sm:gap-5 justify-between">
            <div className="w-full gap-3 sm:gap-5 flex items-center overflow-hidden rounded-[18px] border border-border h-14 sm:h-20 bg-white px-4 sm:px-6">
              <Input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="h-full border-0 bg-transparent px-0 shadow-none focus-visible:ring-0"
                placeholder="Enter Certificate ID..."
                autoComplete="off"
                disabled={pending}
              />
            </div>
            <Button
              type="submit"
              size="icon-lg"
              disabled={pending || !certId.trim()}
              className="size-14 sm:size-20 shrink-0 rounded-2xl"
            >
              <MagnifyingGlassIcon className="text-primary-foreground w-5 h-5 sm:w-7 sm:h-7" />
            </Button>
          </div>
        </form>
      </div>

      <VerifyCertificateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        certificateId={certId.trim().toUpperCase()}
        status={verifyStatus}
        result={result}
      />
    </>
  );
}
