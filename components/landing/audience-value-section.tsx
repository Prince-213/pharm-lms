"use client";

import Image from "next/image";
import {
  Briefcase,
  Clock,
  GraduationCap,
  Presentation,
  SealCheck,
  Users,
  Wallet,
  type Icon,
} from "@phosphor-icons/react";
import type { AudiencePageContent } from "@/lib/audience-landing-content";
import { IconBadge } from "@/components/landing/icon-badge";

const featureIcons: Record<string, Icon> = {
  "Course builder & curriculum": Presentation,
  "Reach pharmacy professionals": Users,
  "Earn on your terms": Wallet,
  "Flexible scheduling": Clock,
  "Career & exam guidance": GraduationCap,
  "Verified mentor profile": SealCheck,
};

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
                  <IconBadge
                    icon={featureIcons[feature.title] ?? Briefcase}
                    className="size-14 rounded-full"
                    iconClassName="size-7"
                  />
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
          </div>
        </div>
      </div>
    </section>
  );
}
