import type { ComponentType } from "react";
import Link from "next/link";
import {
  BarChart3,
  BookOpen,
  Briefcase,
  Calendar,
  Lightbulb,
  Users,
  Video,
  Wallet,
} from "@/lib/icons/server";
import Image from "next/image";
import { PartnersSection } from "./partners-section";
import {
  getLandingContent,
  type HeroBadgeIcon,
  type LandingAudience,
} from "@/lib/landing-content";

const badgeIcons: Record<HeroBadgeIcon, ComponentType<{ className?: string }>> = {
  BookOpen,
  Briefcase,
  Lightbulb,
  Users,
  Calendar,
  Video,
  BarChart3,
  Wallet,
};

type HeroSectionProps = {
  audience?: LandingAudience;
};

export function HeroSection({ audience = "student" }: HeroSectionProps) {
  const { hero } = getLandingContent(audience);

  return (
    <section className="relative overflow-x-hidden bg-gradient-to-br from-emerald-50/60 via-white to-white py-8 lg:py-16">
      <div
        className="pointer-events-none absolute -left-20 -top-20 h-72 w-72 rounded-full bg-[var(--emerald)]/8 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute bottom-0 right-0 h-64 w-64 rounded-full bg-emerald-100/40 blur-2xl"
        aria-hidden
      />

      <div className="relative mx-auto grid w-[90%] lg:w-[80%] items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-8 lg:px-10">
        <div>
          <Image
            src="/assets/twirl-top.png"
            className="absolute -left-34 top-0 opacity-60"
            alt=""
            width={420}
            height={420}
          />

          <h1 className="font-display text-4xl font-bold leading-tight tracking-tight text-[var(--ink-deep)] sm:text-5xl lg:text-[4.25rem]">
            {hero.headline.map((line, i) => (
              <span key={i}>
                {i > 0 && <br />}
                {line.before}
                <span className="text-[var(--emerald)]">{line.highlight}</span>
                {line.after}
              </span>
            ))}
          </h1>

          <p className="mt-5 max-w-lg text-base leading-relaxed text-[#646464] sm:text-lg">
            {hero.subcopy}
          </p>

          <div className="mt-8 flex flex-wrap gap-5">
            <Link
              href={hero.primaryCta.href}
              className="inline-flex items-center rounded-xl bg-[var(--emerald)] px-[28px] py-4.5 text-[18px] text-sm font-semibold text-white shadow-md transition hover:bg-[var(--primary)] active:scale-95"
            >
              {hero.primaryCta.label}
            </Link>
            <Link
              href={hero.secondaryCta.href}
              className="inline-flex z-50 items-center rounded-lg bg-emerald-50 px-[28px] py-4.5 text-[18px] text-sm font-semibold text-[var(--emerald)] shadow-xl shadow-gray-300/40 transition active:scale-95"
            >
              {hero.secondaryCta.label}
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap gap-8 text-base font-medium text-slate-600">
            {hero.badges.map((badge) => {
              const Icon = badgeIcons[badge.icon];
              return (
                <span key={badge.label} className="flex items-center gap-2">
                  {badge.imageSrc ? (
                    <Image
                      src={badge.imageSrc}
                      className="h-[32px] w-[32px] object-contain"
                      alt=""
                      width={32}
                      height={32}
                    />
                  ) : (
                    <Icon
                      className={[
                        "h-[32px] w-[32px]",
                        badge.icon === "BookOpen" && audience === "student"
                          ? "text-amber-500"
                          : "text-[var(--emerald)]",
                      ].join(" ")}
                    />
                  )}
                  {badge.label}
                </span>
              );
            })}
          </div>
        </div>

        <div className="relative mx-auto flex w-full max-w-sm items-center justify-center lg:max-w-none">
          <Image
            src="/assets/twirl-right.png"
            className="absolute -right-40 -bottom-40 opacity-80"
            alt=""
            width={420}
            height={420}
          />
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center"
            aria-hidden
          >
            <div className="absolute h-[520px] w-[520px] rounded-full border border-slate-300 sm:h-[580px] sm:w-[580px]" />
          </div>

          <div className="relative h-[550px] w-[550px] translate-x-4 translate-y-4 overflow-hidden rounded-full bg-[var(--emerald)] shadow-2xl sm:h-[550px] sm:w-[550px]">
            <Image
              src={`${hero.image}`}
              alt="Pharmacy professional — Yan Krukau on Pexels"
              className="h-full w-full object-cover object-top"
              fill 
            />
          </div>

          <div className="absolute left-0 top-40 flex min-w-fit -translate-x-5 -translate-y-0 items-center gap-[23px] rounded-[18px] border border-[var(--emerald)] bg-[#F5F5F4] p-[18px] shadow-[var(--shadow-3)] backdrop-blur-sm lg:-left-4">
            <div className="relative h-[50px] w-[50px] overflow-hidden rounded-[11px] shadow-lg shadow-gray-400/60">
              <Image src="/assets/monitor.png" className="object-contain" alt="" fill />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[25px] font-bold leading-tight text-[var(--ink-deep)]">2K+</p>
              <p className="text-[15px] text-gray-500">Video Courses</p>
            </div>
          </div>

          <div className="absolute -top-4 right-0 flex max-w-fit -translate-y-0 flex-col items-center justify-center gap-[5px] rounded-[18px] border border-[var(--emerald)] bg-[#F5F5F4] p-[18px] shadow-[var(--shadow-3)] backdrop-blur-sm lg:right-2">
            <div className="relative h-[80px] w-[80px] overflow-hidden rounded-full">
              <Image src="/assets/Ring.png" className="object-contain" alt="" fill />
            </div>
            <div className="flex flex-col items-center justify-center gap-[8px] text-center">
              <p className="text-[25px] font-bold leading-tight text-[var(--ink-deep)]">5K+</p>
              <p className="text-[15px] text-gray-500">Online Courses</p>
            </div>
          </div>

          <div className="absolute bottom-4 right-0 flex max-w-fit -translate-y-0 items-center gap-[18px] rounded-[18px] border border-[var(--emerald)] bg-[#F5F5F4] p-[18px] shadow-[var(--shadow-3)] backdrop-blur-sm lg:right-10">
            <div className="relative h-[50px] w-[50px] overflow-hidden rounded-[11px] shadow-lg shadow-gray-400/60">
              <Image src="/assets/tutor.png" className="object-contain" alt="" fill />
            </div>
            <div className="flex flex-col gap-[2px]">
              <p className="text-[15px] text-gray-500">Tutors</p>
              <p className="text-[25px] font-bold leading-tight text-[var(--ink-deep)]">250+</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-16">
        <PartnersSection />
      </div>
    </section>
  );
}
