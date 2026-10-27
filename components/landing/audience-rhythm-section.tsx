import Image from "next/image";
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
import type { AudienceRhythmItem } from "@/lib/audience-landing-content";

export function AudienceRhythmSection({
  eyebrow,
  title,
  lead,
  image,
  imageAlt,
  items,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  image: string;
  imageAlt: string;
  items: AudienceRhythmItem[];
}) {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-card sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="space-y-10">
          <div className="space-y-4">
            <LandingEyebrow>{eyebrow}</LandingEyebrow>
            <LandingHeading>{title}</LandingHeading>
            <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground md:text-base">
              {lead}
            </p>
          </div>
          <AnimatedStagger className="flex flex-col">
            {items.map((item, index) => (
              <AnimatedStaggerItem key={item.title}>
                <article className="grid grid-cols-[auto_1fr] gap-5 border-t border-border py-6 md:py-7">
                  <span className="font-mono text-[11px] tracking-[0.14em] text-accent uppercase">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <div>
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
      </LandingContainer>
    </section>
  );
}
