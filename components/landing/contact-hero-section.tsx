"use client";

import { CertificateIcon } from "@phosphor-icons/react";
import Link from "next/link";

export function ContactHeroSection() {
  return (
    <section id="about-hero-section" className="bg-[#f0f0f0]">
      {/* Top heading area */}
      <div className="relative mx-auto max-w-7xl px-4 pb-12 pt-10 sm:px-6 lg:px-10 lg:pb-26 lg:pt-14">
        {/* Breadcrumb */}
        <nav className="mb-6 flex items-center gap-2 text-sm">
          <Link
            href="/"
            className="text-[var(--ink-deep)] hover:text-[var(--emerald)] transition-colors"
          >
            Home
          </Link>
          <span className="text-[var(--muted-soft)]">/</span>
          <span className="text-[var(--emerald)]">Contact Us</span>
        </nav>

        {/* Heading row */}
        <div className="flex items-start justify-between">
          <h1 className="font-display text-3xl font-bold leading-tight text-[var(--ink-deep)] sm:text-4xl lg:text-[3.2rem] lg:leading-[1.15]">
            Ready to assist
            <br />
            whenever you need{" "}
            <span className="relative inline-block">
              Us
              {/* Purple underline image */}
              <img
                src="/assets/underline.png"
                alt=""
                className="absolute -bottom-10 left-0 w-full h-18 object-contain"
                aria-hidden="true"
              />
            </span>
          </h1>

          {/* Decorative arrow */}
          <img
            src="/assets/shape22.png"
            alt=""
            className="hidden lg:block h-16 w-auto mt-2"
            aria-hidden="true"
          />
        </div>
      </div>

      {/* Full-width image section with floating card */}
      <div className="relative w-full">
        <img
          src="/assets/mentor.jpg"
          alt="Online learning experience"
          className="h-72 w-full object-cover sm:h-80 lg:h-[60vh]"
        />

        {/* Floating white card */}
        <div className="absolute bottom-6 right-4 sm:right-6 lg:top-20 lg:right-[40%] xl:right-[20%]"></div>
      </div>
    </section>
  );
}
