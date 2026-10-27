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
import type { AudienceStep } from "@/lib/audience-landing-content";

export function AudienceTimelineSection({
  eyebrow,
  title,
  steps,
}: {
  eyebrow: string;
  title: string;
  steps: AudienceStep[];
}) {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer>
        <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
          <AnimatedSection className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
            <LandingEyebrow>{eyebrow}</LandingEyebrow>
            <LandingHeading>{title}</LandingHeading>
          </AnimatedSection>

          <AnimatedStagger className="relative lg:col-span-7">
            <div
              className="absolute top-5 bottom-5 left-5 w-px bg-border"
              aria-hidden
            />
            {steps.map((step, index) => (
              <AnimatedStaggerItem
                key={step.title}
                className="border-b border-border/70 pb-12 last:border-b-0 last:pb-0"
              >
                <article className="relative flex gap-4 sm:gap-6 md:gap-8">
                  <span className="relative z-10 mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-primary font-mono text-[11px] font-semibold text-primary-foreground sm:size-10 sm:text-xs">
                    {index + 1}
                  </span>
                  <div className="flex min-w-0 flex-1 gap-4 sm:gap-6">
                    <span className="mt-0.5 hidden size-12 shrink-0 items-center justify-center rounded-md bg-primary-soft text-primary sm:flex">
                      <AudienceIcon name={step.icon} className="size-6" />
                    </span>
                    <div className="min-w-0 pt-1">
                      <h3 className="font-display text-lg font-semibold sm:text-xl">
                        {step.title}
                      </h3>
                      <p className="mt-2 max-w-prose text-[15px] leading-relaxed text-muted-foreground md:text-base">
                        {step.body}
                      </p>
                    </div>
                  </div>
                </article>
              </AnimatedStaggerItem>
            ))}
          </AnimatedStagger>
        </div>
      </LandingContainer>
    </section>
  );
}
