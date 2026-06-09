"use client";

import Image from "next/image";
import { useState } from "react";

const faqs = [
  {
    question: "What is PharmLMS and how does it work?",
    answer:
      "PharmLMS is an online learning platform offering interactive clinical pharmacy courses, expert-led tutorials, and personalized learning paths to help you achieve your educational goals efficiently. You can browse courses, enroll, and learn at your own pace.",
  },
  {
    question: "How can I communicate with my instructor?",
    answer:
      "You can communicate with instructors through our built-in messaging system, course discussion forums, and live Q&A sessions. Premium courses also offer direct video consultation sessions.",
  },
  {
    question: "Are there interactive features for students?",
    answer:
      "Yes! PharmLMS includes interactive quizzes, hands-on assignments, AI-powered quiz assistance, discussion forums, and live mentorship sessions to ensure an engaging learning experience.",
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
                    className={`overflow-hidden rounded-[16px] transition-all duration-300 ${
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
                      <span className="ml-4 flex h-8 w-8 items-center justify-center rounded-full text-xl font-bold transition-all">
                        {isOpen ? "×" : "+"}
                      </span>
                    </button>
                    <div
                      className={`overflow-hidden transition-all font-semibold duration-300 ${
                        isOpen ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                      }`}
                    >
                      <div className="px-6 pb-6 text-[14px] leading-relaxed text-white/90">
                        {faq.answer}
                      </div>
                    </div>
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
