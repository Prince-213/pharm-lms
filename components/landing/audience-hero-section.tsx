"use client";

import { CertificateIcon } from "@phosphor-icons/react";
import Link from "next/link";
import type { AudiencePageContent } from "@/lib/audience-landing-content";

export function AudienceHeroSection({
  content,
}: {
  content: AudiencePageContent;
}) {
  return (
    <section className="bg-[#f0f0f0]">
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pb-26 lg:pt-14">
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-[var(--ink-deep)] transition-colors hover:text-[var(--emerald)]"
          >
            Home
          </Link>
          <span className="text-[var(--muted-soft)]">/</span>
          <span className="text-[var(--emerald)]">{content.breadcrumb}</span>
        </nav>

        <div className="flex items-start justify-between">
          <h1 className="font-display text-3xl font-bold leading-tight text-[var(--ink-deep)] sm:text-4xl lg:text-[3.2rem] lg:leading-[1.15]">
            {content.heroTitleLine1}
            <br />
            {content.heroTitleLine2}{" "}
            <span className="relative inline-block">
              {content.heroHighlight}
              <img
                src="/assets/underline.png"
                alt=""
                className="absolute -bottom-10 left-0 h-16 w-full object-contain"
                aria-hidden="true"
              />
            </span>
          </h1>

          <img
            src="/assets/shape22.png"
            alt=""
            className="mt-2 hidden h-16 w-auto lg:block"
            aria-hidden="true"
          />
        </div>
      </div>

      <div className="relative w-full">
        <img
          src={content.heroImage}
          alt={content.heroImageAlt}
          className="h-72 w-full object-cover sm:h-80 lg:h-[60vh]"
        />

        <div className="absolute bottom-6 right-4 sm:right-6 lg:top-20 lg:right-[40%] xl:right-[20%]">
          <div className="w-64 rounded-[20px] bg-white p-6 sm:w-72 lg:w-80 lg:px-8 lg:py-12">
            <div className="mb-4 flex items-start justify-between">
              <span className="font-display text-4xl font-bold text-[var(--ink-deep)] lg:text-6xl">
                {content.statCard.value}
              </span>
              <CertificateIcon className="h-12 w-12" aria-hidden />
            </div>
            <h3 className="mb-2 font-display text-base font-bold text-[var(--ink-deep)] lg:text-lg">
              {content.statCard.title}
            </h3>
            <p className="text-xs font-semibold leading-relaxed text-[var(--muted-soft)]">
              {content.statCard.body}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
