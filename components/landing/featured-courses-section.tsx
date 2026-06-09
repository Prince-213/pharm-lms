"use client";

import Image from "next/image";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { BookIcon } from "@phosphor-icons/react";

type CourseCard = {
  id: string;
  title: string;
  priceLabel: string;
  instructor: { name: string };
  lessons: string;
  duration: string;
  image: string;
  href: string;
};

const fallbackCourses: CourseCard[] = [
  {
    id: "1",
    href: "/courses",
    title: "Advanced Data Analytics",
    priceLabel: "$59.00",
    instructor: { name: "Robert Dawson" },
    lessons: "20 Lessons",
    duration: "5 Hour 15 Min",
    image: "/assets/featured-courses/course-1.jpg",
  },
  {
    id: "2",
    href: "/courses",
    title: "Full-Stack Web Development",
    priceLabel: "$65.00",
    instructor: { name: "Emily Davis" },
    lessons: "25 Lessons",
    duration: "6 Hour 00 Min",
    image: "/assets/featured-courses/course-2.jpg",
  },
  {
    id: "3",
    href: "/courses",
    title: "Machine Learning Essentials",
    priceLabel: "$75.00",
    instructor: { name: "Andrew Smith" },
    lessons: "18 Lessons",
    duration: "4 Hour 45 Min",
    image: "/assets/featured-courses/course-3.jpg",
  },
];

type FeaturedCoursesSectionProps = {
  courses?: CourseCard[];
};

export function FeaturedCoursesSection({ courses }: FeaturedCoursesSectionProps) {
  const displayCourses = (courses?.length ?? 0) > 0 ? courses! : fallbackCourses;

  return (
    <section
      id="featured-courses"
      className="w-full bg-[#EFEFEF] py-20 lg:py-28"
    >
      <div className="mx-auto w-[90%] sm:w-[85%] lg:w-[70%]">
        <h2 className="text-center text-[28px] font-bold leading-[1.2] tracking-[-0.02em] text-black sm:text-[34px] lg:text-[44px]">
          <span className="relative inline-block">
            <span className="relative inline-block px-1">
              <span className="relative z-[1]">Our</span>
              <Image
                src="/assets/hightlight-crown.svg"
                alt=""
                width={92}
                height={56}
                className="pointer-events-none absolute bottom-[2px] left-1/2 z-0 h-auto w-[108%] max-w-none -translate-x-1/2"
                aria-hidden
              />
            </span>
          </span>{" "}
          Featured Top-Rated Courses
        </h2>

        <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7 lg:mt-16 xl:grid-cols-3">
          {displayCourses.map((course) => (
            <article
              key={course.id}
              className="flex h-full flex-col rounded-[14px] bg-white p-5 sm:p-6"
            >
              <div className="relative aspect-[412/248] w-full overflow-hidden rounded-[10px]">
                <Image
                  src={course.image}
                  alt={course.title}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                  className="object-cover"
                />
              </div>

              <div className="mt-5 flex items-start justify-between gap-3">
                <h3 className="text-[16px] font-bold leading-[1.35] text-black sm:text-[18px]">
                  {course.title}
                </h3>
                <p className="shrink-0 text-[16px] font-bold text-[var(--accent)] sm:text-[18px]">
                  {course.priceLabel}
                </p>
              </div>

              <p className="mt-2 text-[13px] font-medium text-[#555555] sm:text-[14px]">
                by {course.instructor.name}
              </p>

              <div className="mt-5 flex overflow-hidden rounded-[10px] bg-[#F3F4F6]">
                <div className="flex flex-1 items-center gap-3 px-4 py-4">
                  <BookIcon
                    className="h-6 w-6 shrink-0 text-[var(--accent)] sm:h-7 sm:w-7"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-[11px] font-medium text-[#777777] sm:text-[12px]">
                      Lessons
                    </p>
                    <p className="text-[13px] font-bold text-black sm:text-[14px]">
                      {course.lessons}
                    </p>
                  </div>
                </div>

                <div className="w-px self-stretch bg-[#E5E7EB]" aria-hidden />

                <div className="flex flex-1 items-center gap-3 px-4 py-4">
                  <Clock3
                    className="h-6 w-6 shrink-0 text-[var(--accent)] sm:h-7 sm:w-7"
                    strokeWidth={1.75}
                  />
                  <div>
                    <p className="text-[11px] font-medium text-[#777777] sm:text-[12px]">
                      Duration
                    </p>
                    <p className="text-[13px] font-bold text-black sm:text-[14px]">
                      {course.duration}
                    </p>
                  </div>
                </div>
              </div>

              <Link
                href={course.href}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#E5E7EB] bg-white px-5 py-3.5 text-[14px] font-semibold text-black transition hover:border-[var(--accent)] hover:text-[var(--accent)] sm:text-[15px]"
              >
                View Courses
                <span aria-hidden>→</span>
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
