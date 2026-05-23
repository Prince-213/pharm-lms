"use client";

import { useState } from "react";
import {
  BarChart3,
  BookOpen,
  Calendar,
  ChevronRight,
  FlaskConical,
  MessageCircle,
  ShieldCheck,
  Stethoscope,
  Users,
  Video,
  Wallet,
  type AppIcon,
} from "@/lib/icons/client";
import {
  getLandingContent,
  type LandingAudience,
  type ServiceIconKey,
} from "@/lib/landing-content";

const serviceIconMap: Record<ServiceIconKey, AppIcon> = {
  FlaskConical,
  Stethoscope,
  ShieldCheck,
  Users,
  Calendar,
  Video,
  BarChart3,
  Wallet,
  BookOpen,
  MessageCircle,
};

type ServicesSectionProps = {
  audience?: LandingAudience;
};

export function ServicesSection({ audience = "student" }: ServicesSectionProps) {
  const { services } = getLandingContent(audience);
  const [active, setActive] = useState(0);
  const cards = services.groups[active] ?? services.groups[0];

  return (
    <section id="services" className="bg-white py-16 lg:py-16">
      <div className="mx-auto w-[90%] lg:w-[80%] px-4 sm:px-6 lg:px-10">
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--emerald)]">
            {services.eyebrow}
          </p>
          <h2 className="text-3xl font-bold font-semibold text-[var(--ink-deep)] sm:text-4xl">
            {services.titleLines[0]}
            <br className="hidden sm:block" />
            {services.titleLines[1]}
          </h2>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((svc) => {
            const Icon = serviceIconMap[svc.icon];
            return (
              <div
                key={svc.title}
                className={[
                  "group flex flex-col rounded-2xl p-7 transition-all duration-300",
                  svc.highlighted
                    ? "bg-[var(--emerald)] text-white shadow-lg"
                    : "border border-slate-100 bg-white shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-3)]",
                ].join(" ")}
              >
                <div
                  className={[
                    "mb-5 flex h-12 w-12 items-center justify-center rounded-xl",
                    svc.highlighted ? "bg-white/20" : "bg-emerald-50",
                  ].join(" ")}
                >
                  <Icon
                    className={["h-6 w-6", svc.highlighted ? "text-white" : "text-[var(--emerald)]"].join(" ")}
                    strokeWidth={1.75}
                  />
                </div>

                <h3
                  className={[
                    "font-display text-xl font-bold",
                    svc.highlighted ? "text-white" : "text-[var(--ink-deep)]",
                  ].join(" ")}
                >
                  {svc.title}
                </h3>

                <p
                  className={[
                    "mt-3 flex-1 text-sm leading-relaxed",
                    svc.highlighted ? "text-white/80" : "text-[var(--muted-soft)]",
                  ].join(" ")}
                >
                  {svc.description}
                </p>

                <button
                  type="button"
                  className={[
                    "mt-6 flex items-center gap-1 text-sm font-semibold transition-colors",
                    svc.highlighted
                      ? "text-white hover:text-white/80"
                      : "text-[var(--emerald)] hover:text-[var(--primary)]",
                  ].join(" ")}
                >
                  Learn More <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        {services.groups.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {services.groups.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Services page ${i + 1}`}
                className={[
                  "h-2.5 rounded-full transition-all duration-300",
                  i === active
                    ? "w-7 bg-[var(--emerald)]"
                    : "w-2.5 bg-slate-300 hover:bg-slate-400",
                ].join(" ")}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
