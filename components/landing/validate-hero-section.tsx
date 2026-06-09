"use client";

import { useState } from "react";
import { MagnifyingGlassIcon } from "@phosphor-icons/react";
import { VerifyCertificateModal, type VerifyResult } from "@/components/landing/verify-certificate-modal";

export function ValidateHeroSection() {
  const [certId, setCertId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"loading" | "done">("loading");
  const [result, setResult] = useState<VerifyResult>({ status: null });

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!certId.trim()) return;

    setModalOpen(true);
    setVerifyStatus("loading");
    setResult({ status: null });

    // Simulate API verification
    setTimeout(() => {
      const isValid = certId.trim().length >= 6;
      if (isValid) {
        setResult({
          status: "valid",
          certificateId: certId.trim().toUpperCase(),
          courseName: "Advanced Clinical Pharmacy",
          recipientName: "Prince E. Izuogu",
          issuedDate: "June 2026",
        });
      } else {
        setResult({
          status: "invalid",
          message: "The certificate ID is too short. Please enter a valid certificate ID.",
        });
      }
      setVerifyStatus("done");
    }, 2000);
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
            <div className="w-full gap-3 sm:gap-5 flex items-center overflow-hidden rounded-[18px] border border-[var(--border)] h-14 sm:h-20 bg-white">
              <input
                type="text"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                className="outline-none border-none w-full px-4 sm:px-6 text-sm"
                placeholder="Enter Certificate ID..."
              />
            </div>
            <button
              type="submit"
              className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl bg-[var(--emerald)] flex items-center justify-center shrink-0"
            >
              <MagnifyingGlassIcon className="text-white w-5 h-5 sm:w-7 sm:h-7" />
            </button>
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
