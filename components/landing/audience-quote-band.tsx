import Image from "next/image";
import { LandingContainer } from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";

export function AudienceQuoteBand({
  quote,
  by,
  image,
  imageAlt,
}: {
  quote: string;
  by: string;
  image: string;
  imageAlt: string;
}) {
  return (
    <section className="bg-primary text-primary-foreground">
      <LandingContainer className="grid items-stretch lg:grid-cols-2">
        <AnimatedSection className="flex flex-col justify-center py-20 md:py-24 lg:py-28 lg:pr-20">
          <blockquote className="max-w-xl space-y-7">
            <p className="font-display text-balance text-[1.45rem] leading-[1.2] font-semibold tracking-[-0.02em] sm:text-[1.75rem] md:text-[2rem]">
              {quote}
            </p>
            <footer className="font-mono text-[11px] tracking-[0.12em] text-accent uppercase">
              {by}
            </footer>
          </blockquote>
        </AnimatedSection>
        <div className="relative aspect-[16/10] min-h-[200px] sm:min-h-[240px] lg:aspect-auto lg:min-h-[420px]">
          <Image
            src={image}
            alt={imageAlt}
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-primary/20" aria-hidden />
        </div>
      </LandingContainer>
    </section>
  );
}
