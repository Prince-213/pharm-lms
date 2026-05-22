"use client";

import { useState } from "react";
import Link from "next/link";
import { Clock, Star, ArrowUpRight } from "lucide-react";

type Course = {
  image: string;
  imageAlt: string;
  category: string;
  title: string;
  description: string;
  rating: number;
  reviewCount: number;
  instructor: { name: string; avatar: string; enrolled: number };
  price: number;
  duration: string;
};

const coursePages: Course[][] = [
  [
    {
      image: "https://images.pexels.com/photos/8199252/pexels-photo-8199252.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Student studying pharmacy at library — Yan Krukau on Pexels",
      category: "Pharmacy",
      title: "Pharmaceutical Chemistry Fundamentals",
      description:
        "Master the chemistry behind drugs to excel in UI Design, pharmacokinetics and drug formulation.",
      rating: 4.3,
      reviewCount: 16325,
      instructor: { name: "Jane Cooper", avatar: "https://i.pravatar.cc/40?u=janecooper", enrolled: 2001 },
      price: 17.84,
      duration: "08 hr 12 mins",
    },
    {
      image: "https://images.pexels.com/photos/4307849/pexels-photo-4307849.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Person studying online course — Ketut Subiyanto on Pexels",
      category: "Clinical",
      title: "Clinical Pharmacy Practice",
      description:
        "Design evidence-based care plans for patients across various clinical pharmacy settings.",
      rating: 3.9,
      reviewCount: 832,
      instructor: { name: "Jenny Wilson", avatar: "https://i.pravatar.cc/40?u=jennywilson", enrolled: 2001 },
      price: 8.99,
      duration: "06 hr 3 mins",
    },
    {
      image: "https://images.pexels.com/photos/8312669/pexels-photo-8312669.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Professional pharmacist working — Dayana Joseph on Pexels",
      category: "Safety",
      title: "Drug Interaction Management",
      description:
        "Learn to identify and manage clinically significant drug interactions in modern practice.",
      rating: 4.2,
      reviewCount: 125,
      instructor: { name: "Esther Howard", avatar: "https://i.pravatar.cc/40?u=estherhoward", enrolled: 2001 },
      price: 11.70,
      duration: "01 hr 2 mins",
    },
  ],
  [
    {
      image: "https://images.pexels.com/photos/7693189/pexels-photo-7693189.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Healthcare professionals collaborating — Yan Krukau on Pexels",
      category: "Pharmacology",
      title: "Advanced Pharmacokinetics",
      description:
        "Deep-dive into drug absorption, distribution, metabolism and excretion for clinical application.",
      rating: 4.5,
      reviewCount: 980,
      instructor: { name: "Albert Flores", avatar: "https://i.pravatar.cc/40?u=albertflores", enrolled: 1500 },
      price: 19.99,
      duration: "10 hr 30 mins",
    },
    {
      image: "https://images.pexels.com/photos/8199174/pexels-photo-8199174.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Student holding books — Yan Krukau on Pexels",
      category: "Therapeutics",
      title: "Medication Therapy Management",
      description:
        "Optimise patient outcomes through comprehensive medication reviews and patient counseling.",
      rating: 4.7,
      reviewCount: 2100,
      instructor: { name: "Theresa Webb", avatar: "https://i.pravatar.cc/40?u=theresawebb", enrolled: 3200 },
      price: 14.50,
      duration: "07 hr 45 mins",
    },
    {
      image: "https://images.pexels.com/photos/7640741/pexels-photo-7640741.jpeg?auto=compress&cs=tinysrgb&w=600",
      imageAlt: "Team collaborating in office — Yan Krukau on Pexels",
      category: "Regulatory",
      title: "Pharmacy Law & Compliance",
      description:
        "Navigate federal and state pharmacy laws, ethics and professional responsibilities with confidence.",
      rating: 4.1,
      reviewCount: 540,
      instructor: { name: "Courtney Henry", avatar: "https://i.pravatar.cc/40?u=courtneyhenry", enrolled: 1200 },
      price: 12.00,
      duration: "05 hr 15 mins",
    },
  ],
];

function StarRating({ rating }: { rating: number }) {
  return (
    <span className="flex items-center gap-1">
      <span className="text-sm font-bold text-[var(--emerald)]">{rating.toFixed(1)}</span>
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

export function PopularCoursesSection() {
  const [active, setActive] = useState(0);
  const courses = coursePages[active];

  return (
    <section className="bg-slate-50/50 py-16 lg:py-20">
      <div className="mx-auto w-[90%] lg:w-[80%] px-4 sm:px-6 lg:px-10">
        {/* Header */}
        <div className="mb-10">
          <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-[var(--emerald)]">
            Explore Programs
          </p>
          <h2 className="font-display text-3xl font-extrabold text-[var(--ink-deep)] sm:text-4xl">
            Our Most Popular Class
          </h2>
          <p className="mt-3 max-w-lg text-[var(--muted-soft)]">
            Let&apos;s join our famous class, the knowledge provided will definitely be useful for you.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.title}
              className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-[var(--shadow-1)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-3)]"
            >
              {/* Image */}
              <div className="relative overflow-hidden">
                <img
                  src={course.image}
                  alt={course.imageAlt}
                  className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute right-3 top-3 flex items-center gap-1.5 rounded-full bg-white/90 px-3 py-1 text-xs font-semibold text-slate-700 backdrop-blur-sm shadow-sm">
                  <Clock className="h-3.5 w-3.5 text-slate-500" />
                  {course.duration}
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-1 flex-col p-5">
                <p className="mb-1.5 text-xs font-bold uppercase tracking-widest text-[var(--emerald)]">
                  {course.category}
                </p>
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-display text-lg font-bold leading-snug text-[var(--ink-deep)] line-clamp-1">
                    {course.title}
                  </h3>
                  <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition-colors group-hover:text-[var(--emerald)]" />
                </div>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--muted-soft)] line-clamp-2">
                  {course.description}
                </p>

                {/* Rating */}
                <div className="mt-3 flex items-center gap-2">
                  <StarRating rating={course.rating} />
                  <span className="text-xs text-slate-400">
                    ({course.reviewCount.toLocaleString()})
                  </span>
                </div>

                {/* Instructor + Price */}
                <div className="mt-4 flex items-center gap-3 border-t border-slate-100 pt-4">
                  <img
                    src={course.instructor.avatar}
                    alt={course.instructor.name}
                    className="h-8 w-8 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-semibold text-[var(--ink-deep)]">
                      {course.instructor.name}
                    </p>
                    <p className="text-xs text-slate-400">
                      {course.instructor.enrolled.toLocaleString()} Enrolled
                    </p>
                  </div>
                  <p className="shrink-0 text-lg font-extrabold text-[var(--emerald)]">
                    ${course.price.toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination dots */}
        <div className="mt-8 flex justify-center gap-2">
          {coursePages.map((_, i) => (
            <button
              key={i}
              onClick={() => setActive(i)}
              aria-label={`Course page ${i + 1}`}
              className={[
                "h-2.5 rounded-full transition-all duration-300",
                i === active
                  ? "w-7 bg-[var(--emerald)]"
                  : "w-2.5 bg-slate-300 hover:bg-slate-400",
              ].join(" ")}
            />
          ))}
        </div>

        {/* CTA */}
        <div className="mt-8 flex justify-center">
          <Link
            href="/student/browse"
            className="rounded-xl border border-slate-300 bg-white px-8 py-3 text-sm font-bold text-[var(--ink-deep)] shadow-sm transition hover:border-[var(--emerald)] hover:text-[var(--emerald)] active:scale-95"
          >
            Explore All Programs
          </Link>
        </div>
      </div>
    </section>
  );
}
