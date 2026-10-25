"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { AnimatedCounter } from "@/components/landing/motion-primitives";

export function EmpowerSection() {
  return (
    <section id="empower" className="w-full">
      <div className="grid min-h-0 sm:min-h-[420px] lg:min-h-[520px] lg:grid-cols-2 xl:min-h-[640px]">
        <div className="relative min-h-[360px] lg:min-h-full">
          <Image
            src="/assets/kevin-ku-w7ZyuGYNpRQ-unsplash.jpg"
            alt="Student learning with a tablet at home"
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center"
          />

          <div className="animate-float absolute bottom-6 left-[8%] z-10 flex items-center gap-3 rounded-[16px] bg-white p-4 shadow-[0_12px_40px_rgba(15,23,42,0.12)] sm:bottom-8 sm:p-6 lg:p-5 xl:p-8">
            <div className="min-w-0">
              <div className="flex items-center gap-3">
                <Image
                  src={"/assets/satisfied.png"}
                  alt={"satisfied"}
                  width={70}
                  height={70}
                  className="h-10 w-10 sm:h-12 sm:w-12 xl:h-[70px] xl:w-[70px]"
                />
                <AnimatedCounter
                  value="45K+"
                  className="text-3xl font-bold leading-none text-black sm:text-4xl xl:text-5xl"
                />
              </div>
              <p className="mt-3 text-sm leading-[1.2] font-medium text-[#5A536C]">
                Happy Students Worldwide
              </p>
            </div>
          </div>
        </div>

        <div className="relative flex items-center bg-[var(--emerald)] px-6 py-12 sm:px-10 sm:py-14 lg:px-10 lg:py-14 xl:px-[72px] xl:py-[88px]">
          <div className="relative z-10 w-[90%] lg:w-[86%] xl:w-[80%]">
            <h2 className="text-[28px] font-bold leading-[1.15] tracking-[-0.02em] text-white sm:text-[34px] md:text-[36px] lg:text-[38px] xl:text-5xl">
              <span className="relative inline-block">
                <span className="relative inline-block">
                  <span className="relative z-[1]">Empower</span>
                  <Image
                    src="/assets/hightlight-crown.svg"
                    alt=""
                    width={50}
                    height={16}
                    className="pointer-events-none absolute -bottom-[16px] left-0 z-0 h-auto w-[100%] max-w-none"
                    aria-hidden
                  />
                </span>
              </span>{" "}
              Your Learning Journey From Anywhere
            </h2>

            <div className="mt-8 space-y-5 text-sm leading-[1.75] text-white/95 font-medium">
              <p>
                PharmEdge is dedicated to equipping African pharmacists with the
                data, technology, and health innovation skills needed to compete
                for digital health roles.
              </p>
              <p>
                As Africa's first pharmacy-specific platform, we create an
                inclusive learning environment built around clinical contexts
                and real-world case studies that encourage growth and success.
              </p>
            </div>

            <div className="mt-10">
              <Link
                href="/about"
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-black px-8 py-4 text-[15px] font-semibold text-white transition-all duration-300 hover:bg-[#111111] hover:-translate-y-0.5 active:scale-[0.98]"
              >
                Learn More About Us
                <ArrowRight className="h-4 w-4" strokeWidth={2.25} />
              </Link>
            </div>
          </div>

          <Image
            src="/assets/shape21.png"
            alt=""
            width={76}
            height={76}
            className="animate-float pointer-events-none absolute bottom-8 right-[8%] z-0 h-12 w-12 object-contain sm:h-14 sm:w-14 xl:h-[76px] xl:w-[76px]"
            aria-hidden
          />
        </div>
      </div>
    </section>
  );
}
