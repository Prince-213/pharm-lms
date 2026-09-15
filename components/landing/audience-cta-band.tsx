"use client";

import type { AudiencePageContent } from "@/lib/audience-landing-content";
import { MarketingAuthCtas } from "@/components/landing/marketing-auth-ctas";

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
        <MarketingAuthCtas
          loginHref={content.loginHref}
          loginLabel={content.loginLabel}
          signupHref={content.signupHref}
          signupLabel={content.signupLabel}
          variant="onPrimary"
          className="mt-8 justify-center"
        />
      </div>
    </section>
  );
}
