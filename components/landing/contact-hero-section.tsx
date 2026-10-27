import Image from "next/image";
import {
  LandingContainer,
  LandingEyebrow,
  landingDisplayTitleClass,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";

export function ContactHeroSection() {
  return (
    <section className="bg-background pt-16 md:pt-20 lg:pt-24">
      <LandingContainer className="grid items-end gap-12 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-20">
        <AnimatedSection className="max-w-xl space-y-5 pb-4 lg:pb-20">
          <LandingEyebrow>Contact</LandingEyebrow>
          <h1 className={landingDisplayTitleClass}>
            Write to the team that{" "}
            <span className="text-primary">runs PharmEdge</span>
          </h1>
          <p className="max-w-md text-[15px] leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Courses, teaching, mentorship, certificates, or a partnership — send
            the context. We read every message.
          </p>
        </AnimatedSection>

        <div className="relative aspect-[4/5] overflow-hidden sm:aspect-[5/4] lg:aspect-auto lg:min-h-[440px] xl:min-h-[520px]">
          <Image
            src="/assets/marketing/contact-team.jpg"
            alt="PharmEdge team in a working discussion"
            fill
            sizes="(max-width: 1024px) 100vw, 55vw"
            className="object-cover"
            priority
          />
        </div>
      </LandingContainer>
    </section>
  );
}
