"use client";

import Image from "next/image";
import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { MOTION_EASE } from "@/components/landing/motion-primitives";

const faqs = [
  {
    question: "What is PharmLMS and how does it work?",
    answer:
      "PharmLMS is Africa's first pharmacy-specific digital health education platform by PharmAnalytics. It offers structured courses, expert-led tutorials, and personalized learning paths built around real African clinical contexts — helping pharmacists move from dispensing to decision-making.",
  },
  {
    question: "How can I communicate with my instructor?",
    answer:
      "You can communicate with instructors through our built-in messaging system, course discussion forums, and live Q&A sessions. Premium courses also offer direct mentorship and video consultation with practicing pharmacists and health informaticists.",
  },
  {
    question: "Are there interactive features for students?",
    answer:
      "Yes! PharmLMS includes interactive quizzes, hands-on assignments, AI-powered quiz assistance, discussion forums, and live mentorship sessions to ensure an engaging, clinically grounded learning experience.",
  },
  {
    question: "How can I pay for courses?",
    answer:
      "We accept multiple payment methods including credit/debit cards, bank transfers, and mobile money. All transactions are secure and processed through our trusted payment partner.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState(0);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <section
      id="faq"
      className="relative bg-white py-16 lg:py-24 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-start lg:gap-12 xl:gap-16">
          {/* Left image */}
          <div className="relative mx-auto mb-10 w-full max-w-sm shrink-0 lg:mx-0 lg:mb-0 lg:max-w-md xl:max-w-lg">
            <div className="overflow-hidden rounded-[24px] h-[50vh] lg:h-[65vh] bg-red-400 relative">
              <Image
                src="/assets/linkedin-sales-solutions-6ie6OjshvWg-unsplash.jpg"
                alt="Student learning"
                fill
                className="h-auto w-full object-cover object-center"
              />
            </div>
          </div>

          {/* Right content */}
          <div className="flex-1">
            <h2 className="mb-8 font-display text-3xl font-bold text-[var(--ink-deep)] sm:text-4xl lg:text-[2.5rem] leading-tight">
              Frequently <span className="text-[var(--emerald)]">Asked</span>
              <br />
              Questions
            </h2>

            <div className="space-y-4">
              {faqs.map((faq, index) => {
                const isOpen = openIndex === index;
                return (
                  <div
                    key={index}
                    className={`overflow-hidden rounded-[16px] transition-colors duration-300 ${
                      isOpen
                        ? "bg-[var(--emerald)] text-white"
                        : "bg-[#f5f5f5] text-[var(--ink-deep)]"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => toggle(index)}
                      className="flex w-full items-center justify-between px-6 py-5 text-left font-semibold text-lg lg:text-xl"
                    >
                      <span>{faq.question}</span>
                      <motion.span
                        animate={{ rotate: isOpen ? 45 : 0 }}
                        transition={{ duration: 0.25, ease: MOTION_EASE }}
                        className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold"
                      >
                        +
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.3, ease: MOTION_EASE }}
                          className="overflow-hidden"
                        >
                          <div className="px-6 pb-6 text-[14px] font-semibold leading-relaxed text-white/90">
                            {faq.answer}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
