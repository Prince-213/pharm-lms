"use client";

import Link from "next/link";
import type { AudiencePageContent } from "@/lib/audience-landing-content";

export function AudienceCtaBand({
  content,
}: {
  content: AudiencePageContent;
}) {
  return (
    <section className="bg-[var(--primary)] py-14 lg:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-2xl font-bold text-white sm:text-3xl lg:text-4xl">
          {content.ctaHeadline}
        </h2>
        <p className="mt-4 text-sm leading-relaxed text-white/80 sm:text-base">
          {content.ctaSubtext}
        </p>
        <Link
          href={content.signupHref}
          className="mt-8 inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-primary transition-all hover:bg-white/90"
        >
          {content.signupLabel}
        </Link>
      </div>
    </section>
  );
}
