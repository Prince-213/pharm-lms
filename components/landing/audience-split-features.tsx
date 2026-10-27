import Image from "next/image";
import Link from "next/link";
import { AudienceIcon } from "@/components/landing/audience-icon";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import type { AudienceFeature } from "@/lib/audience-landing-content";

export function AudienceSplitFeatures({
  eyebrow,
  title,
  image,
  imageAlt,
  features,
}: {
  eyebrow: string;
  title: string;
  image: string;
  imageAlt: string;
  features: AudienceFeature[];
}) {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-muted sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="flex flex-col gap-10">
          <div className="space-y-4">
            <LandingEyebrow>{eyebrow}</LandingEyebrow>
            <LandingHeading>{title}</LandingHeading>
          </div>
          <ul className="flex flex-col gap-9">
            {features.map((feature) => (
              <li key={feature.title} className="flex gap-5">
                <span className="flex size-12 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <AudienceIcon name={feature.icon} className="size-6" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-lg font-semibold">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                  <Link
                    href={feature.href}
                    className="mt-2 inline-flex items-center text-sm font-semibold text-primary hover:underline"
                  >
                    Learn more →
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
