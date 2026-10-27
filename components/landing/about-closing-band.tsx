import Image from "next/image";
import Link from "next/link";
import { LandingContainer } from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";

export function AboutClosingBand() {
  return (
    <section className="relative overflow-hidden">
      <Image
        src="/assets/marketing/about-cta.jpg"
        alt="Team collaborating around laptops and notes"
        fill
        sizes="100vw"
        className="object-cover object-center"
        aria-hidden
      />
      <div className="absolute inset-0 bg-primary/85" aria-hidden />
      <LandingContainer className="relative py-20 md:py-28 xl:py-32">
        <AnimatedSection className="mx-auto flex max-w-2xl flex-col items-center gap-6 text-center text-primary-foreground">
          <h2 className="font-display text-balance text-[1.55rem] leading-[1.15] font-semibold tracking-[-0.02em] sm:text-[1.85rem] md:text-[2.2rem] xl:text-[2.6rem]">
            Your next role starts with level one.
          </h2>
          <Button
            asChild
            className="h-12 rounded-md bg-accent px-8 text-base font-semibold text-accent-foreground hover:bg-accent/90"
          >
            <Link href="/student/signup">Start learning free</Link>
          </Button>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
