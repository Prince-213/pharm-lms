"use client";

import { useState, useTransition } from "react";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import {
  VerifyCertificateModal,
  type VerifyResult,
} from "@/components/landing/verify-certificate-modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyCertificate } from "@/lib/certificates/verify-certificate";

function formatIssueDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

export function VerifyBandSection() {
  const [certId, setCertId] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [verifyStatus, setVerifyStatus] = useState<"loading" | "done">(
    "loading",
  );
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
    <section id="verify" className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer>
        <AnimatedSection className="grid items-center gap-10 rounded-md bg-muted px-7 py-10 sm:px-10 sm:py-12 lg:grid-cols-2 lg:gap-16 lg:px-14 lg:py-16">
          <div className="space-y-4">
            <LandingEyebrow>Certificates employers can check</LandingEyebrow>
            <LandingHeading className="text-[1.7rem] sm:text-[2rem] xl:text-[2.35rem]">
              Every certificate has a public verification page.
            </LandingHeading>
            <p className="max-w-xl text-[16px] leading-relaxed text-muted-foreground">
              Share your Certified Digital Health Pharmacist credential with a
              recruiter and they can confirm it in seconds. We are building
              recognition of the credential with employers and recruiters in our
              network.
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-4">
            <label htmlFor="landing-cert-id" className="text-sm font-medium">
              Certificate ID
            </label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Input
                id="landing-cert-id"
                value={certId}
                onChange={(e) => setCertId(e.target.value)}
                placeholder="Paste a certificate ID"
                autoComplete="off"
                disabled={pending}
                className="h-[52px] flex-1 rounded-xl bg-card px-4 text-base"
              />
              <Button
                type="submit"
                disabled={pending || !certId.trim()}
                className="h-[52px] rounded-xl px-6"
              >
                Verify certificate
              </Button>
            </div>
          </form>
        </AnimatedSection>
      </LandingContainer>

      <VerifyCertificateModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        certificateId={certId.trim().toUpperCase()}
        status={verifyStatus}
        result={result}
      />
    </section>
  );
}
