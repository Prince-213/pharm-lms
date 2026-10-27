import { Check } from "@phosphor-icons/react/ssr";
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
import type { AudienceChecklistItem } from "@/lib/audience-landing-content";

export function AudienceChecklistSection({
  eyebrow,
  title,
  lead,
  items,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  items: AudienceChecklistItem[];
}) {
  return (
    <section className="bg-muted py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-2xl space-y-4">
          <LandingEyebrow>{eyebrow}</LandingEyebrow>
          <LandingHeading>{title}</LandingHeading>
          <p className="text-[15px] leading-relaxed text-muted-foreground md:text-base">
            {lead}
          </p>
        </AnimatedSection>

        <AnimatedStagger className="grid gap-5 sm:grid-cols-2 lg:gap-6">
          {items.map((item) => (
            <AnimatedStaggerItem key={item.title}>
              <article className="flex h-full items-start gap-4 rounded-md bg-card px-6 py-6 sm:px-7 sm:py-7">
                <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
                  <Check className="size-3.5" weight="bold" />
                </span>
                <div className="min-w-0">
                  <h3 className="font-display text-base font-semibold">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                    {item.body}
                  </p>
                </div>
              </article>
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
