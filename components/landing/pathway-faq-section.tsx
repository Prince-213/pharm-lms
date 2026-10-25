"use client";

import Link from "next/link";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { AnimatedSection } from "@/components/landing/motion-primitives";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";

const faqs = [
  {
    q: "Do I need to know coding or be good at maths?",
    a: "No. The pathway assumes zero experience. You start in Excel and add one tool at a time, so each new skill builds on something you already know.",
  },
  {
    q: "Can I study while working full-time?",
    a: "Yes. Learning is self-paced and built around a full-time job. Most learners finish in four to six months. You need a laptop or computer, a reliable internet connection, and free or trial versions of the software used in the courses.",
  },
  {
    q: "Will this get me a job?",
    a: "The pathway builds the skills for roles such as clinical data analyst, pharmacovigilance analyst and health informatics specialist. Mentors help with your portfolio, CV and interview preparation, and we work with recruiters in our network. We open doors and support you through the move, but we do not guarantee a job.",
  },
  {
    q: "Is the certificate recognised?",
    a: "Every certificate can be checked on the public verification page, so employers can confirm it. We are building recognition of the credential with employers and recruiters in our network.",
  },
  {
    q: "How much does it cost?",
    a: "Each course page shows its price, and some courses are free. Subscription pricing for the full platform will be announced at launch.",
  },
  {
    q: "Why not just use YouTube, Coursera or ALX?",
    a: "Those are not built around pharmacy problems, African clinical contexts or a pharmacist career path. PharmEdge adds pharmacist tutors, 1:1 mentorship and a community of pharmacists making the same move.",
  },
];

export function PathwayFaqSection() {
  return (
    <section className="bg-muted py-16 md:py-20 xl:py-24">
      <LandingContainer className="grid items-start gap-10 lg:grid-cols-12 lg:gap-16">
        <AnimatedSection className="space-y-3 lg:sticky lg:top-24 lg:col-span-5">
          <LandingEyebrow>Questions</LandingEyebrow>
          <LandingHeading>What pharmacists ask before they start.</LandingHeading>
          <p className="text-[16px] text-muted-foreground">
            Something else?{" "}
            <Link href="/contact" className="font-semibold text-primary hover:underline">
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
          className="gap-3"
        >
          {faqs.map((faq, index) => (
            <AccordionItem
              key={faq.q}
              value={`item-${index}`}
              className="rounded-2xl border border-border/80 bg-card px-5 not-last:border-b-0 data-open:border-primary/30"
            >
              <AccordionTrigger className="py-5 text-left text-[16px] font-semibold hover:no-underline md:text-[17px]">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="max-w-2xl pb-5 text-[15px] leading-relaxed text-muted-foreground">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
