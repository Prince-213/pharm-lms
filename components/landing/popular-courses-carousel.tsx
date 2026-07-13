"use client";

import { useState } from "react";
import Link from "next/link";
import {
  PopularCourseCard,
  type PopularCourseCardView,
} from "@/components/landing/popular-course-card";

type PopularCoursesCarouselProps = {
  eyebrow: string;
  title: string;
  description: string;
  pages: PopularCourseCardView[][];
  cta: { label: string; href: string };
};

export function PopularCoursesCarousel({
  eyebrow,
  title,
  description,
  pages,
  cta,
}: PopularCoursesCarouselProps) {
  const [active, setActive] = useState(0);
  const courses = pages[active] ?? pages[0] ?? [];

  return (
    <section className="bg-slate-50/50 py-16 lg:py-20">
      <div className="mx-auto w-[90%] px-4 sm:px-6 lg:w-[80%] lg:px-10">
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--emerald)]">
            {eyebrow}
          </p>
          <h2 className="font-display text-3xl font-bold text-[var(--ink-deep)] sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 max-w-lg text-[var(--muted-soft)]">{description}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <PopularCourseCard key={course.id} course={course} />
          ))}
        </div>

        {pages.length > 1 && (
          <div className="mt-8 flex justify-center gap-2">
            {pages.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActive(i)}
                aria-label={`Programs page ${i + 1}`}
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

        <div className="mt-8 flex justify-center">
          <Link
            href={cta.href}
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-[var(--ink-deep)] shadow-sm transition hover:border-[var(--emerald)] hover:text-[var(--emerald)] active:scale-95"
          >
            {cta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}

export type { PopularCourseCardView };
