"use client";

import { useState } from "react";
import { FlaskConical, Stethoscope, ShieldCheck, ChevronRight } from "lucide-react";

const serviceGroups = [
  [
    {
      icon: FlaskConical,
      title: "Pharmaceutical Sciences",
      description:
        "Lessons on drug chemistry and formulation that cover the most recent developments.",
      highlighted: true,
    },
    {
      icon: Stethoscope,
      title: "Clinical Pharmacy",
      description:
        "Classes in clinical practice that cover the most recent advancements in patient care.",
      highlighted: false,
    },
    {
      icon: ShieldCheck,
      title: "Drug Safety & Pharmacovigilance",
      description:
        "Drug safety courses that cover the most recent regulatory trends and reporting.",
      highlighted: false,
    },
  ],
  [
    {
      icon: FlaskConical,
      title: "Pharmacokinetics",
      description:
        "In-depth modules on drug absorption, distribution, metabolism and excretion.",
      highlighted: true,
    },
    {
      icon: Stethoscope,
      title: "Therapeutics Management",
      description:
        "Evidence-based therapeutic decision-making for complex patient cases.",
      highlighted: false,
    },
    {
      icon: ShieldCheck,
      title: "Medication Safety",
      description:
        "Best practices for identifying and preventing medication errors in clinical settings.",
      highlighted: false,
    },
  ],
  [
    {
      icon: FlaskConical,
      title: "Compounding Practice",
      description:
        "Hands-on modules covering sterile and non-sterile compounding techniques.",
      highlighted: true,
    },
    {
      icon: Stethoscope,
      title: "Pharmacy Law & Ethics",
      description:
        "Regulatory frameworks, ethical principles and professional responsibility.",
      highlighted: false,
    },
    {
      icon: ShieldCheck,
      title: "Health Informatics",
      description:
        "Digital tools and data systems shaping modern pharmacy practice.",
      highlighted: false,
    },
  ],
];

export function ServicesSection() {
  const [active, setActive] = useState(0);
  const services = serviceGroups[active];

  return (
    <section className="bg-white py-16 lg:py-16">
      <div className="mx-auto w-[90%] lg:w-[80%] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10 text-center">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--emerald)]">
            Our Services
          </p>
          <h2 className="font-semibold text-3xl font-extrabold text-[var(--ink-deep)] sm:text-4xl">
            Fostering a playful &amp; engaging
            <br className="hidden sm:block" /> learning environment
          </h2>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((svc) => {
            const Icon = svc.icon;
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
                    svc.highlighted
                      ? "bg-white/20"
                      : "bg-emerald-50",
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

        {/* Pagination dots */}
        <div className="mt-8 flex justify-center gap-2">
          {serviceGroups.map((_, i) => (
            <button
              key={i}
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
      </div>
    </section>
  );
}
