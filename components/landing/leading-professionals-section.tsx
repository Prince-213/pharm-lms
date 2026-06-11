"use client";

import Link from "next/link";
import { getLandingContent } from "@/lib/landing-content";
import Image from "next/image";

export function LeadingProfessionalsSection() {
  const { people } = getLandingContent("student");
  const professionals = people.members;

  return (
    <section
      id="leading-professionals"
      className="relative bg-[var(--background)] py-16 lg:py-24 overflow-hidden"
    >
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        {/* Header row */}
        <div className="mb-10 lg:mb-14 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="relative inline-block">
            {/* Crown icon */}
            <img
              src="/assets/hightlight-crown.svg"
              alt=""
              className="absolute -top-8 left-2 h-8 w-auto"
              aria-hidden="true"
            />
            <h2 className="text-[34px] w-[80%] font-bold leading-[1.15] tracking-[-0.02em] text-black sm:text-[40px] lg:text-[48px]">
              <span className="relative inline-block">
                <span className="relative inline-block px-1">
                  <span className="relative z-[1]">Master</span>
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
              Your Skills with Leading Professionals
            </h2>
          </div>

          <Link
            href="/courses"
            className="inline-flex items-center justify-center rounded-[10px] bg-[var(--emerald)] px-7 py-4.5 text-sm font-semibold text-white  transition-all hover:bg-[var(--primary-strong)] hover:shadow-[0_12px_32px_rgba(30,64,175,0.45)] shrink-0"
          >
            View All Courses
          </Link>
        </div>

        {/* Portrait grid - 4 capsule images */}
        <div className=" grid grid-cols-1 lg:grid-cols-4 justify-center gap-4 lg:gap-8">
          {professionals.map((person, index) => (
            <div
              key={person.name}
              className={` lg:translate-y-[${index % 2 ? "50px" : "0px"}] relative w-full h-[30rem] lg:w-full lg:h-[35rem] rounded-[90px] lg:rounded-[200px] overflow-hidden shadow-lg bg-slate-100`}
            >
              <Image
                src={person.avatar.replace("/80?", "/400?")}
                alt={person.name}
                className="h-full w-full object-cover object-cover bg-center bg-cover"
                fill
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
