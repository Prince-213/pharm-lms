"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Clock, Star } from "@/lib/icons/server";
export type PopularCourseCardView = {
  id: string;
  href: string;
  image: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  instructor: { name: string; avatar: string; enrolled: number };
  priceLabel: string;
  duration: string;
};

type PopularCoursesCarouselProps = {
  eyebrow: string;
  title: string;
  description: string;
  pages: PopularCourseCardView[][];
  cta: { label: string; href: string };
};

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-sm font-bold text-[var(--emerald)]">
        {rating.toFixed(1)}
      </span>
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className="h-3.5 w-3.5"
          fill={s <= Math.round(rating) ? "#ca8a04" : "none"}
          color={s <= Math.round(rating) ? "#ca8a04" : "#cbd5e1"}
          strokeWidth={1.5}
        />
      ))}
    </span>
  );
}

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
            <Link
              key={course.id}
              href={course.href}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[var(--shadow-1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-3)]"
            >
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.imageAlt}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm backdrop-blur-sm">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {course.duration}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[var(--emerald)]">
                  {course.category}
                </p>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display line-clamp-1 text-lg font-bold leading-snug text-[var(--ink-deep)]">
                    {course.title}
                  </h3>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[var(--emerald)]" />
                </div>
                <p className="mt-2 line-clamp-2 flex-1 text-sm leading-relaxed text-[var(--muted-soft)]">
                  {course.description}
                </p>

                <div className="mt-3 flex items-center gap-2">
                  <StarRating rating={course.rating} />
                  <span className="text-xs text-slate-400">
                    ({course.reviewCount.toLocaleString()})
                  </span>
                </div>

                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-[var(--ink-deep)]">
                      {course.instructor.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {course.instructor.enrolled.toLocaleString()} Enrolled
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-bold text-[var(--emerald)]">
                    {course.priceLabel}
                  </p>
                </div>
              </div>
            </Link>
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
