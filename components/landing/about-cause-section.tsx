import {
  LandingContainer,
  LandingHeading,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";

export function AboutCauseSection() {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-24">
        <AnimatedSection>
          <LandingHeading>We do this for a single cause.</LandingHeading>
        </AnimatedSection>
        <AnimatedSection delay={0.08} className="max-w-xl space-y-5">
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            Africa&apos;s digital health economy is growing rapidly, yet few
            platforms offer pharmacists a structured entry point. PharmEdge is
            Africa&apos;s first pharmacy-specific digital health education
            platform by PharmAnalytics.
          </p>
          <p className="text-base leading-relaxed text-muted-foreground md:text-lg">
            It offers structured courses, expert-led tutorials, and a pathway
            built around real African clinical contexts — helping pharmacists
            move from dispensing to decision-making without leaving the job they
            already have.
          </p>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
