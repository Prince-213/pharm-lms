"use client";

import Link from "next/link";
import { Clock, GraduationCap, Briefcase } from "lucide-react";
import Image from "next/image";

export function AboutFreshSection() {
  return (
    <section
      id="about-fresh"
      className="bg-[#f0f0f0] py-16 lg:py-24 overflow-hidden"
    >
      <div className="relative mx-auto lg:w-[80%] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col items-center gap-10 lg:flex-row lg:gap-12 xl:gap-16">
          {/* Left side: composite image */}
          <div className="relative w-full max-w-md lg:max-w-lg xl:max-w-xl shrink-0">
            <img
              src="/assets/about.png"
              alt="Students learning"
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Right side: content */}
          <div className="flex-1">
            {/* Title */}
            <h2 className="font-display text-3xl font-bold text-[var(--ink-deep)] sm:text-4xl lg:text-[3.5rem] leading-tight mb-6">
              A Fresh Approach to
              <br />
              Enhancing{" "}
              <span className="relative inline-block text-[var(--emerald)]">
                Your Skills
                {/* Black swoosh underline */}
                <Image
                  src="/assets/title-shape.png"
                  width={200}
                  height={20}
                  alt="title-arrow"
                />
              </span>
            </h2>

            {/* Description with purple left border */}
            <div className="border-l-2 border-[var(--emerald)] pl-5 mb-8">
              <p className="text-[var(--muted)] text-sm leading-relaxed lg:text-sm font-semibold">
                Possessing a strong education is among the most important
                advantages a person can hold. It profoundly impacts personal and
                professional development.
              </p>
            </div>

            {/* Feature items */}
            <div className="space-y-6">
              {/* Flexible Study Hours */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--emerald)] text-[var(--emerald)]">
                  <Image
                    src={"/assets/call.svg"}
                    alt="calls"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink-deep)] lg:text-lg">
                    Flexible Study Hours
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                    Flexible scheduling empowers students to learn at their own
                    pace and convenience.
                  </p>
                </div>
              </div>

              {/* Qualified Instructors */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--emerald)] text-[var(--emerald)]">
                  <Image
                    src={"/assets/instructors.svg"}
                    alt="calls"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink-deep)] lg:text-lg">
                    Qualified Instructors
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                    Every Instructor is certified and holds advanced degrees,
                    ensuring you&apos;re guided by true professionals.
                  </p>
                </div>
              </div>

              {/* Advance Your Career */}
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-[var(--emerald)] text-[var(--emerald)]">
                  <Image
                    src={"/assets/career.svg"}
                    alt="calls"
                    width={24}
                    height={24}
                  />
                </div>
                <div>
                  <h3 className="font-display text-base font-bold text-[var(--ink-deep)] lg:text-lg">
                    Advance Your Career
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                    Build confidence for job interviews through realistic
                    practice sessions, detailed feedback, and presentation tips.
                  </p>
                </div>
              </div>
            </div>

            {/* Know More button */}
            <div className="mt-8">
              <Link
                href="/courses"
                className="inline-flex items-center justify-center rounded-full bg-[var(--emerald)] px-8 py-4.5 text-sm font-semibold text-white  transition-all hover:bg-[#6B4CE6] hover:shadow-[0_12px_32px_rgba(123,92,255,0.45)]"
              >
                Know More
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
