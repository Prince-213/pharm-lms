import Link from "next/link";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import type { AudienceFaq } from "@/lib/audience-landing-content";

export function AudienceFaqSection({
  title,
  faqs,
}: {
  title: string;
  faqs: AudienceFaq[];
}) {
  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="grid items-start gap-12 lg:grid-cols-12 lg:gap-16">
        <AnimatedSection className="space-y-4 lg:sticky lg:top-28 lg:col-span-5">
          <LandingEyebrow>Questions</LandingEyebrow>
          <LandingHeading>{title}</LandingHeading>
          <p className="text-[16px] text-muted-foreground">
            Something else?{" "}
            <Link
              href="/contact"
              className="font-semibold text-primary hover:underline"
            >
              Contact the team
            </Link>
            .
          </p>
        </AnimatedSection>

        <AnimatedSection delay={0.08} className="lg:col-span-7">
          <Accordion
            type="single"
            collapsible
            defaultValue="item-0"
            className="gap-4"
          >
            {faqs.map((faq, index) => (
              <AccordionItem
                key={faq.question}
                value={`item-${index}`}
                className="rounded-md border border-border/80 bg-card px-4 not-last:border-b-0 data-open:border-primary/30 sm:px-6"
              >
                <AccordionTrigger className="py-5 text-left text-[15px] leading-snug font-semibold hover:no-underline sm:py-6 sm:text-[16px] md:text-[17px]">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="max-w-2xl pb-6 text-[15px] leading-relaxed text-muted-foreground">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
