"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { getLandingContent } from "@/lib/landing-content";
import Image from "next/image";
import { AnimatePresence, motion } from "motion/react";
import { MOTION_EASE } from "@/components/landing/motion-primitives";

export function WhatLearnersSaySection() {
  const { testimonials } = getLandingContent("student");
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section
      id="what-learners-say"
      className="relative bg-[var(--background)] py-16 lg:py-20 overflow-hidden"
    >
      {/* Top-right decorative shape14 (white arrow) */}
      <img
        src="/assets/shape14.png"
        alt=""
        className="absolute top-4 right-10 lg:top-8 lg:right-22 w-32 h-32 lg:w-48 lg:h-48 object-contain opacity-60 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative mx-auto w-[90%] lg:w-[75%]   px-4 sm:px-6 lg:px-10">
        {/* Section Heading */}
        <div className="mb-10 lg:mb-14">
          <div className="relative inline-block">
            {/* Crown icon */}
          
            <h2 className="text-[34px] w-[80%] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[40px] lg:text-[48px]">
              <span className="relative inline-block">
                <span className="relative inline-block px-1">
                  <span className="relative z-[1]">What</span>
                  <Image
                    src="/assets/hightlight-crown.svg"
                    alt=""
                    width={92}
                    height={56}
                    className="pointer-events-none absolute -bottom-[8px] left-1/2 z-0 h-auto w-[118%] max-w-none -translate-x-1/2"
                    aria-hidden
                  />
                </span>
              </span>{" "}
               Learner's are saying about PharmLms
            </h2>
          </div>
        </div>

        {/* White card */}
        <div className="relative rounded-[12px] bg-white px-6 py-10 lg:px-14 lg:py-12 ">
          <div className="flex flex-col items-center gap-8 lg:flex-row lg:gap-12">
            {/* Left: testimonial composite image */}
            <div className="relative flex-shrink-0">
              <img
                src="/assets/testimonial.png"
                alt="Testimonial"
                className="w-64 h-64 lg:w-80 lg:h-80 object-contain"
              />
            </div>

            {/* Right: testimonial content */}
            <div className="flex-1 max-w-xl overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div
                  key={active}
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -16 }}
                  transition={{ duration: 0.35, ease: MOTION_EASE }}
                >
                  {/* Stars */}
                  <div className="flex gap-1 mb-5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className="h-5 w-5 fill-[#FBBF24] text-[#FBBF24]"
                      />
                    ))}
                  </div>

                  {/* Quote */}
                  <blockquote className="mb-6 text-lg font-medium leading-relaxed text-[var(--ink-deep)] lg:text-xl">
                    &ldquo;{t.quote}&rdquo;
                  </blockquote>

                  {/* Author */}
                  <div className="flex items-center gap-3 mb-8">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="h-11 w-11 rounded-full object-cover ring-2 ring-white shadow-sm"
                    />
                    <div>
                      <p className="font-semibold text-[var(--ink-deep)]">
                        {t.name}
                      </p>
                      <p className="text-sm text-[var(--muted-soft)]">{t.role}</p>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dot indicators */}
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActive(i)}
                    aria-label={`Testimonial ${i + 1}`}
                    className={`h-2.5 rounded-full transition-all duration-300 ${
                      i === active
                        ? "w-7 bg-[var(--emerald)]"
                        : "w-2.5 bg-slate-300 hover:bg-slate-400"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Bottom-right decorative shape14 (purple doodle) */}
          <div
            className="absolute bottom-6 right-6 lg:bottom-10 lg:right-10 w-16 h-16 lg:w-24 lg:h-24 pointer-events-none"
            style={{
              backgroundColor: "var(--emerald)",
              maskImage: "url(/assets/shape13.png)",
              WebkitMaskImage: "url(/assets/shape13.png)",
              maskSize: "contain",
              WebkitMaskSize: "contain",
              maskRepeat: "no-repeat",
              WebkitMaskRepeat: "no-repeat",
              maskPosition: "center",
              WebkitMaskPosition: "center",
              
            }}
            aria-hidden="true"
          />
        </div>
      </div>
    </section>
  );
}
