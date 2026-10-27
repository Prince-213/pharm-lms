import Image from "next/image";
import { AudienceIcon } from "@/components/landing/audience-icon";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import type { AudienceWhoItem } from "@/lib/audience-landing-content";

export function AudienceWhoSection({
  eyebrow,
  title,
  lead,
  items,
  image,
  imageAlt,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  items: AudienceWhoItem[];
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection className="space-y-10">
          <div className="space-y-4">
            <LandingEyebrow>{eyebrow}</LandingEyebrow>
            <LandingHeading>{title}</LandingHeading>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base">
              {lead}
            </p>
          </div>
          <AnimatedStagger className="flex flex-col gap-8">
            {items.map((item) => (
              <AnimatedStaggerItem key={item.title}>
                <article className="flex gap-5">
                  <span className="flex size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary">
                    <AudienceIcon name={item.icon} className="size-6" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-display text-lg font-semibold">
                      {item.title}
                    </h3>
                    <p className="mt-1.5 text-[15px] leading-relaxed text-muted-foreground">
                      {item.body}
                    </p>
                  </div>
                </article>
              </AnimatedStaggerItem>
            ))}
          </AnimatedStagger>
        </AnimatedSection>

        <AnimatedSection delay={0.08}>
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
      </LandingContainer>
    </section>
  );
}
