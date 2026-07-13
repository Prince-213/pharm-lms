"use client";

import Image from "next/image";
import {
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import {
  FeaturedCourseCard,
  type FeaturedCourseCardView,
} from "@/components/landing/featured-course-card";

const fallbackCourses: FeaturedCourseCardView[] = [
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
  courses?: FeaturedCourseCardView[];
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

        <AnimatedStagger className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-2 md:gap-7 lg:mt-16 xl:grid-cols-3">
          {displayCourses.map((course) => (
            <AnimatedStaggerItem key={course.id}>
              <FeaturedCourseCard course={course} ctaLabel="View Courses" />
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </div>
    </section>
  );
}
