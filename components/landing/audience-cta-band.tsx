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
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Link
            href={content.loginHref}
            className="inline-flex min-w-[200px] items-center justify-center rounded-full bg-white px-8 py-4 text-sm font-semibold text-[var(--primary)] transition-all hover:bg-white/90"
          >
            {content.loginLabel}
          </Link>
          <Link
            href={content.signupHref}
            className="text-sm font-semibold text-white underline-offset-2 hover:underline"
          >
            {content.signupLabel}
          </Link>
        </div>
      </div>
    </section>
  );
}
