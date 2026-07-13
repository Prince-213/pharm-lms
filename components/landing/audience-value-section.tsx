"use client";

import Image from "next/image";
import Link from "next/link";
import type { AudiencePageContent } from "@/lib/audience-landing-content";

export function AudienceValueSection({
  content,
}: {
  content: AudiencePageContent;
}) {
  return (
    <section className="overflow-hidden bg-[#f0f0f0] py-16 lg:py-24">
      <div className="relative mx-auto px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-12 xl:gap-16">
          <div className="relative w-full max-w-md shrink-0 lg:max-w-lg xl:max-w-xl">
            <img
              src={content.valueImage}
              alt={content.valueImageAlt}
              className="h-auto w-full object-contain"
            />
          </div>

          <div className="flex-1">
            <h2 className="mb-6 font-display text-3xl font-bold leading-tight text-[var(--ink-deep)] sm:text-4xl lg:text-[3.5rem]">
              {content.valueTitleLine1}
              <br />
              {content.valueTitleLine2}{" "}
              <span className="relative inline-block text-[var(--emerald)]">
                {content.valueHighlight}
                <Image
                  src="/assets/title-shape.png"
                  width={200}
                  height={20}
                  alt=""
                  aria-hidden
                />
              </span>
            </h2>

            <div className="mb-8 border-l-2 border-[var(--emerald)] pl-5">
              <p className="text-sm font-semibold leading-relaxed text-muted-foreground lg:text-sm">
                {content.valueIntro}
              </p>
            </div>

            <div className="space-y-6">
              {content.features.map((feature) => (
                <div key={feature.title} className="flex items-start gap-4">
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--emerald)] text-[var(--emerald)]">
                    <Image
                      src={feature.icon}
                      alt=""
                      width={24}
                      height={24}
                      aria-hidden
                    />
                  </div>
                  <div>
                    <h3 className="font-display text-base font-bold text-[var(--ink-deep)] lg:text-lg">
                      {feature.title}
                    </h3>
                    <p className="mt-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                      {feature.body}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <Link
                href={content.loginHref}
                className="inline-flex items-center justify-center rounded-full bg-[var(--emerald)] px-8 py-4.5 text-sm font-semibold text-white transition-all hover:bg-[var(--primary-strong)] hover:shadow-[0_12px_32px_rgba(30,64,175,0.45)]"
              >
                {content.loginLabel}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
