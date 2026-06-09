"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import Image from "next/image";
import { PaperPlaneIcon } from "@phosphor-icons/react";

export function NewsletterSection() {
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement newsletter subscription logic
    console.log("Subscribe:", email);
  };

  return (
    <section
      id="newsletter"
      className="relative bg-[#f0f0f0] pb-16 lg:pb-24 overflow-hidden"
    >
      <div className="relative mx-auto w-[90%] lg:w-[70%] px-4 sm:px-6 lg:px-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:gap-8 xl:gap-12 relative border-b pb-20 border-gray-400 ">
          {/* Left side: Title + subtitle */}
          <div className="relative flex-1 mb-10 lg:mb-0">
            {/* Crown icon */}
            <img
              src="/assets/hightlight-crown.svg"
              alt=""
              className="absolute -top-8 left-2 h-8 w-auto"
              aria-hidden="true"
            />
            <h2 className="text-[34px]  font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[40px] lg:text-[52px]">
              <span className="relative inline-block">
                <span className="relative inline-block px-1">
                  <span className="relative z-[1]">Keep</span>
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
              It Fresh With Us
            </h2>
            <p className="text-[var(--muted-soft)] text-sm leading-relaxed max-w-lg mt-5 font-medium">
              Get the latest insights, tutorials, and course updates delivered
              straight to your inbox. Never miss out on what&apos;s new in
              online learning and skill development.
            </p>
          </div>

          {/* Middle: Purple curved arrow */}

          <Image src="/assets/shape15.png" alt="Arrow" width={100}  height={100} className=" absolute right-[38%]"/>

          {/* Right side: White card */}
          <div className="w-full xl:max-w-[40%] lg:shrink-0">
            <div className="rounded-b-[24px] bg-white p-8 lg:p-14 ">
              <h3 className="font-display text-2xl font-bold text-[var(--ink-deep)] mb-3">
                Subscribe Our Newsletter
              </h3>
              <p className="text-gray-800 font-medium text-sm leading-relaxed mb-6">
                Subscribe now to receive exclusive learning tips, updates on new
                courses, and special offers.
              </p>

              <form onSubmit={handleSubmit} className="relative">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full rounded-r-full rounded-bl-full bg-[#1a1a2e] pl-6 pr-14 py-5 text-sm text-white placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-[var(--emerald)] transition-all"
                    required
                  />
                  <button
                    type="submit"
                    className="absolute right-2 flex h-10 w-10 items-center justify-center "
                    aria-label="Subscribe"
                  >
                    <PaperPlaneIcon className="h-6 w-6 rotate-45 text-white" />
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
