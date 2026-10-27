"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import {
  AnimatedSection,
  MOTION_EASE,
} from "@/components/landing/motion-primitives";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "What is PharmEdge and how does it work?",
    answer:
      "PharmEdge is Africa's first pharmacy-specific digital health education platform by PharmAnalytics. It offers structured courses, expert-led tutorials, and personalized learning paths built around real African clinical contexts — helping pharmacists move from dispensing to decision-making.",
  },
  {
    question: "How can I communicate with my instructor?",
    answer:
      "You can communicate with instructors through our built-in messaging system, course discussion forums, and live Q&A sessions. Premium courses also offer direct mentorship and video consultation with practicing pharmacists and health informaticists.",
  },
  {
    question: "Are there interactive features for students?",
    answer:
      "Yes. PharmEdge includes interactive quizzes, hands-on assignments, AI-powered quiz assistance, discussion forums, and live mentorship sessions to keep learning clinically grounded.",
  },
  {
    question: "How can I pay for courses?",
    answer:
      "We accept credit and debit cards, bank transfers, and mobile money. All transactions are secure and processed through our payment partner.",
  },
  {
    question: "Who teaches on PharmEdge?",
    answer:
      "Pharmacist instructors who already made the move into data, pharmacovigilance, or digital health. Tutors apply, get reviewed, and publish only after the course is checked.",
  },
  {
    question: "Can I study while working full-time?",
    answer:
      "Yes. The pathway is about 130 hours across six levels, built for evenings and weekends on a laptop or a phone. You keep the job you already have.",
  },
  {
    question: "How do I check a certificate?",
    answer:
      "Every credential has a public page. Enter the certificate ID on Verify — a recruiter can confirm holder, course, and issue date without a login.",
  },
  {
    question: "Who built PharmEdge?",
    answer:
      "PharmEdge is built by PharmAnalytics as Africa's first pharmacy-specific digital health education platform. Contact the team if you are an employer, university, or partnership.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  return (
    <section className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer>
        <div className="mx-auto max-w-3xl">
          <AnimatedSection className="space-y-4">
            <LandingEyebrow>Questions</LandingEyebrow>
            <LandingHeading>Frequently asked questions</LandingHeading>
          </AnimatedSection>

          <AnimatedSection delay={0.08} className="mt-12">
            <div className="divide-y divide-border border-y border-border">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={faq.question}
                    className={cn(
                      "border-l-2 transition-colors",
                      isOpen ? "border-l-accent" : "border-l-transparent",
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? -1 : index)}
                      className="flex w-full items-center justify-between gap-4 px-4 py-5 text-left sm:px-6 sm:py-6"
                      aria-expanded={isOpen}
                    >
                      <span className="text-[15px] leading-snug font-semibold sm:text-[17px]">
                        {faq.question}
                      </span>
                      <span
                        className={cn(
                          "shrink-0 text-lg font-medium",
                          isOpen ? "text-accent" : "text-muted-foreground",
                        )}
                      >
                        {isOpen ? "−" : "+"}
                      </span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen ? (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: MOTION_EASE }}
                          className="overflow-hidden"
                        >
                          <p className="px-4 pb-6 text-[15px] leading-relaxed text-muted-foreground sm:px-6">
                            {faq.answer}
                          </p>
                        </motion.div>
                      ) : null}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </AnimatedSection>
        </div>
      </LandingContainer>
    </section>
  );
}
