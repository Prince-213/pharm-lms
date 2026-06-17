"use client";

import { useState } from "react";
import { getLandingContent, type LandingAudience } from "@/lib/landing-content";

type TestimonialSectionProps = {
  audience?: LandingAudience;
};

export function TestimonialSection({ audience = "student" }: TestimonialSectionProps) {
  const { testimonials } = getLandingContent(audience);
  const [active, setActive] = useState(0);
  const t = testimonials[active];

  return (
    <section className="bg-emerald-50/50 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-10">
        <div className="mb-8 flex justify-center">
          <img
            src="/assets/pharmlms-logo.png"
            alt="PharmLMS"
            className="h-8 w-auto sm:h-9"
          />
        </div>

        <blockquote className="text-center font-display text-2xl font-bold leading-snug text-[var(--ink-deep)] transition-all duration-500 sm:text-3xl lg:text-4xl">
          &ldquo;{t.quote}&rdquo;
        </blockquote>

        <div className="mt-8 flex flex-col items-center gap-2">
          <img
            src={t.avatar}
            alt={t.name}
            className="h-14 w-14 rounded-full object-cover ring-4 ring-white shadow-md"
          />
          <p className="font-semibold text-[var(--ink-deep)]">{t.name}</p>
          <p className="text-sm text-slate-500">{t.role}</p>
        </div>

        <div className="mt-8 flex justify-center gap-2">
          {testimonials.map((_, i) => (
            <button
              key={i}
              type="button"
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
