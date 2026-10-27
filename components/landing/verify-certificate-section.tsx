"use client";

import {
  ChatCircle,
  MagnifyingGlass,
  Path,
  ShieldCheck,
} from "@phosphor-icons/react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { type ReactNode, useEffect, useState, useTransition } from "react";
import {
  LandingContainer,
  LandingEyebrow,
  landingDisplayTitleClass,
} from "@/components/landing/landing-container";
import {
  AnimatedSection,
  MOTION_EASE,
  usePrefersReducedMotion,
} from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { verifyCertificate } from "@/lib/certificates/verify-certificate";
import { cn } from "@/lib/utils";

const SLIDES = [
  {
    src: "/assets/marketing/about-principles.jpg",
    alt: "Professional checking work on a computer",
  },
  {
    src: "/assets/marketing/contact-team.jpg",
    alt: "Team reviewing documents together",
  },
  {
    src: "/assets/marketing/about-how.jpg",
    alt: "Analysts working through a shared report",
  },
  {
    src: "/assets/marketing/mentor-cta.jpg",
    alt: "Hands reviewing a plan on paper",
  },
] as const;

function formatIssueDate(iso: string) {
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

type Result =
  | {
      status: "valid";
      holderName: string;
      courseTitle: string;
      issuedAt: string;
      certificateNumber: string;
    }
  | { status: "invalid" };

function VerifyHeroSlides() {
  const reduced = usePrefersReducedMotion();
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (reduced) return;
    const id = window.setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length);
    }, 4800);
    return () => window.clearInterval(id);
  }, [reduced]);

  return (
    <div className="relative aspect-[6/5] w-full overflow-hidden rounded-md bg-muted">
      {SLIDES.map((slide, i) => (
        <motion.div
          key={slide.src}
          className="absolute inset-0"
          initial={false}
          animate={{
            opacity: i === index ? 1 : 0,
            scale: reduced ? 1 : i === index ? 1 : 1.06,
          }}
          transition={{ duration: reduced ? 0 : 0.95, ease: MOTION_EASE }}
        >
          <Image
            src={slide.src}
            alt={i === index ? slide.alt : ""}
            fill
            sizes="(max-width: 1024px) 100vw, 48vw"
            className="object-cover"
            priority={i === 0}
          />
        </motion.div>
      ))}

      <div
        className="pointer-events-none absolute inset-0 bg-linear-to-t from-primary/25 to-transparent"
        aria-hidden
      />

      <div className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {SLIDES.map((slide, i) => (
          <button
            key={slide.src}
            type="button"
            aria-label={`Show image ${i + 1}`}
            aria-current={i === index}
            onClick={() => setIndex(i)}
            className={cn(
              "h-1.5 rounded-full transition-all duration-300",
              i === index
                ? "w-7 bg-white"
                : "w-1.5 bg-white/55 hover:bg-white/85",
            )}
          />
        ))}
      </div>
    </div>
  );
}

export function VerifyCertificateSection() {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [pending, startTransition] = useTransition();

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    const id = certId.trim();
    if (!id || pending) return;

    startTransition(async () => {
      const certificate = await verifyCertificate(id);
      if (certificate) {
        setResult({
          status: "valid",
          holderName: certificate.holderName,
          courseTitle: certificate.courseTitle,
          issuedAt: formatIssueDate(certificate.issuedAt),
          certificateNumber: certificate.certificateNumber,
        });
      } else {
        setResult({ status: "invalid" });
      }
    });
  };

  return (
    <section className="bg-background">
      <LandingContainer className="grid items-center gap-10 py-12 sm:gap-12 sm:py-16 lg:grid-cols-2 lg:gap-16 lg:py-24 xl:gap-20">
        <AnimatedSection className="order-2 lg:order-1">
          <VerifyHeroSlides />
        </AnimatedSection>

        <AnimatedSection
          delay={0.08}
          className="order-1 space-y-5 sm:space-y-6 lg:order-2"
        >
          <LandingEyebrow>Verify</LandingEyebrow>
          <h1 className={landingDisplayTitleClass}>
            Check a PharmEdge certificate.
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Enter the certificate ID. We confirm whether it was issued on
            PharmEdge, and who it belongs to — no login required.
          </p>

          <form
            onSubmit={handleVerify}
            className="flex max-w-xl flex-col gap-3 pt-1 sm:flex-row sm:items-stretch"
          >
            <label htmlFor="certificate-id" className="sr-only">
              Certificate ID
            </label>
            <Input
              id="certificate-id"
              type="text"
              value={certId}
              onChange={(e) => {
                setCertId(e.target.value);
                setResult(null);
              }}
              placeholder="Certificate ID"
              autoComplete="off"
              disabled={pending}
              className="h-12 min-w-0 flex-1 rounded-md text-base sm:h-[52px]"
            />
            <Button
              type="submit"
              disabled={pending || !certId.trim()}
              className="h-12 shrink-0 gap-2 rounded-md px-6 font-semibold sm:h-[52px] sm:px-7"
            >
              <MagnifyingGlass className="size-4" weight="bold" />
              {pending ? "Checking…" : "Verify"}
            </Button>
          </form>

          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">
            Paste the number exactly as it appears on the document. Anyone with
            the ID can confirm it.
          </p>

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:flex-wrap">
            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary-soft"
            >
              <Path className="size-6 text-primary" weight="duotone" />
              <span className="flex flex-col text-left leading-tight">
                <span className="font-mono text-[10px] tracking-[0.08em] text-muted-soft uppercase">
                  See the steps
                </span>
                <span className="text-sm font-semibold">How it works</span>
              </span>
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-3 rounded-md border border-border bg-card px-4 py-2.5 transition-colors hover:border-primary/30 hover:bg-primary-soft"
            >
              <ChatCircle className="size-6 text-primary" weight="duotone" />
              <span className="flex flex-col text-left leading-tight">
                <span className="font-mono text-[10px] tracking-[0.08em] text-muted-soft uppercase">
                  Need a hand
                </span>
                <span className="text-sm font-semibold">Contact the team</span>
              </span>
            </Link>
          </div>

          {result?.status === "valid" ? (
            <dl className="max-w-xl divide-y divide-border border border-border bg-card">
              <ResultRow
                label="Status"
                value="Valid"
                icon={
                  <ShieldCheck className="size-4 text-primary" weight="bold" />
                }
              />
              <ResultRow label="Holder" value={result.holderName} />
              <ResultRow label="Course" value={result.courseTitle} />
              <ResultRow label="Issued" value={result.issuedAt} />
              <ResultRow label="ID" value={result.certificateNumber} />
            </dl>
          ) : null}

          {result?.status === "invalid" ? (
            <p className="max-w-xl border-l-2 border-accent px-4 py-3 text-[15px] leading-relaxed text-muted-foreground">
              No certificate matches that ID. Check the number and try again.
            </p>
          ) : null}
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}

function ResultRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon?: ReactNode;
}) {
  return (
    <div className="grid gap-1 px-4 py-3 sm:grid-cols-[7rem_1fr] sm:items-center sm:gap-4 sm:px-5">
      <dt className="font-mono text-[11px] tracking-[0.08em] text-muted-soft uppercase">
        {label}
      </dt>
      <dd className="flex items-center gap-2 text-[15px] break-words text-foreground">
        {icon}
        {value}
      </dd>
    </div>
  );
}
