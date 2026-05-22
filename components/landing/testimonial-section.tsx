"use client";

import { useState } from "react";
import { GraduationCap } from "lucide-react";

type Testimonial = {
  quote: string;
  name: string;
  role: string;
  avatar: string;
};

const testimonials: Testimonial[] = [
  {
    quote:
      "PharmLMS was fantastic! It is a master platform for those looking to start a new career, or need a refresher.",
    name: "Jacob Jones",
    role: "Student, National University",
    avatar: "https://i.pravatar.cc/56?u=jacobjones",
  },
  {
    quote:
      "The clinical pharmacy modules are world-class. I passed my board exams on the first attempt thanks to PharmLMS.",
    name: "Sarah Mitchell",
    role: "PharmD Graduate, State University",
    avatar: "https://i.pravatar.cc/56?u=sarahmitchell",
  },
  {
    quote:
      "Incredible platform — structured, easy to follow, and the mentor support is second to none.",
    name: "Daniel Okafor",
    role: "Clinical Pharmacist, Metro Health",
    avatar: "https://i.pravatar.cc/56?u=danielokafor",
  },
];

export function TestimonialSection() {
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section className="bg-emerald-50/50 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        {/* Logo mark */}
        <div className="mb-8 flex justify-center">
          <div className="flex items-center gap-2 font-display text-xl font-bold text-[var(--primary)]">
            <GraduationCap className="h-8 w-8 text-[var(--emerald)]" strokeWidth={1.75} />
            PharmLMS
          </div>
        </div>

        {/* Quote */}
        <blockquote className="text-center font-display text-2xl font-extrabold leading-snug text-[var(--ink-deep)] transition-all duration-500 sm:text-3xl lg:text-4xl">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        {/* Avatar */}
        <div className="mt-8 flex flex-col items-center gap-2">
          <img
            src={t.avatar}
            alt={t.name}
            className="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-md"
          />
          <p className="font-semibold text-[var(--ink-deep)]">{t.name}</p>
          <p className="text-sm text-slate-500">{t.role}</p>
        </div>

        {/* Dots */}
        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Testimonial ${i + 1}`}
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
