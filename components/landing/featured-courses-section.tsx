"use client";

import Link from "next/link";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import {
  FeaturedCourseCard,
  type FeaturedCourseCardView,
} from "@/components/landing/featured-course-card";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { Button } from "@/components/ui/button";

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
    <section id="featured-courses" className="w-full bg-muted py-16 md:py-20 xl:py-24">
      <LandingContainer>
        <AnimatedSection className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-3">
            <LandingEyebrow>Featured courses</LandingEyebrow>
            <LandingHeading>Start with one course today.</LandingHeading>
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-full border-primary px-6 font-medium text-primary transition-transform hover:-translate-y-0.5 hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/courses">Browse all courses</Link>
          </Button>
        </AnimatedSection>

        <AnimatedStagger className="mt-8 grid grid-cols-1 gap-5 sm:mt-10 md:grid-cols-2 lg:grid-cols-3 xl:mt-12">
          {displayCourses.map((course) => (
            <AnimatedStaggerItem key={course.id}>
              <FeaturedCourseCard course={course} ctaLabel="View course" />
            </AnimatedStaggerItem>
          ))}
        </AnimatedStagger>
      </LandingContainer>
    </section>
  );
}
