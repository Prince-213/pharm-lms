import Image from "next/image";
import {
  LandingContainer,
  LandingEyebrow,
  landingDisplayTitleClass,
} from "@/components/landing/landing-container";
import {
  AnimatedCounter,
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";

const stats = [
  { value: "~130", label: "Guided learning hours" },
  { value: "6", label: "Pathway levels" },
  { value: "7+", label: "African countries" },
];

export function AboutHeroSection() {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
        <AnimatedSection>
          <div className="relative aspect-[4/5] overflow-hidden rounded-md bg-primary-soft sm:aspect-[5/4] lg:aspect-[4/5]">
            <Image
              src="/assets/marketing/about-hero.jpg"
              alt="Clinician in a one-to-one consult — the work pharmacists already do"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[20%_center]"
              priority
            />
          </div>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="flex flex-col gap-7">
          <LandingEyebrow>About</LandingEyebrow>
          <h1 className={landingDisplayTitleClass}>
            From dispensing to decision-making.
          </h1>
          <p className="max-w-xl text-[15px] leading-relaxed text-muted-foreground sm:text-base md:text-lg">
            Africa&apos;s digital health economy is growing rapidly, yet few
            platforms offer pharmacists a structured entry point. PharmEdge
            equips you to move beyond dispensing and into the roles defining
            African healthcare.
          </p>
          <AnimatedStagger className="mt-2 grid grid-cols-3 gap-3 border-t border-border pt-6 sm:gap-6 sm:pt-8">
            {stats.map((stat) => (
              <AnimatedStaggerItem key={stat.label}>
                <div className="flex flex-col gap-1">
                  <AnimatedCounter
                    value={stat.value}
                    className="font-display text-xl font-semibold text-primary sm:text-2xl md:text-3xl"
                  />
                  <span className="font-mono text-[9px] leading-snug tracking-[0.08em] text-muted-soft uppercase sm:text-[11px] sm:tracking-[0.1em]">
                    {stat.label}
                  </span>
                </div>
              </AnimatedStaggerItem>
            ))}
          </AnimatedStagger>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
