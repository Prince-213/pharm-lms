import { LandingContainer } from "@/components/landing/landing-container";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import type { AudienceStat } from "@/lib/audience-landing-content";

export function AudienceStatsSection({
  eyebrow,
  stats,
}: {
  eyebrow: string;
  stats: AudienceStat[];
}) {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer>
        <AnimatedSection className="mb-12">
          <p className="font-mono text-[11px] tracking-[0.08em] text-muted-soft uppercase">
            {eyebrow}
          </p>
        </AnimatedSection>
        <AnimatedStagger className="grid gap-8 sm:grid-cols-2 sm:gap-10 xl:grid-cols-4 xl:gap-12">
          {stats.map((stat) => (
            <AnimatedStaggerItem key={stat.label}>
              <article className="border-t border-border pt-5 sm:pt-6">
                <p className="font-display text-2xl font-semibold tracking-[-0.03em] text-primary sm:text-3xl md:text-4xl">
                  {stat.value}
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-muted-foreground">
                  {stat.label}
                </p>
              </article>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
