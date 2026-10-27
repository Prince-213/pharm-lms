"use client";

import Link from "next/link";
import {
  FeaturedCourseCard,
  type FeaturedCourseCardView,
} from "@/components/landing/featured-course-card";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
} from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";

type FeaturedCoursesSectionProps = {
  courses?: FeaturedCourseCardView[];
};

export function FeaturedCoursesSection({
  courses,
}: FeaturedCoursesSectionProps) {
  const displayCourses = courses ?? [];
  const hasCourses = displayCourses.length > 0;

  return (
    <section
      id="featured-courses"
      className="w-full bg-muted py-20 md:py-24 lg:py-28"
    >
      <LandingContainer>
        <AnimatedSection className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl space-y-4">
            <LandingEyebrow>Featured courses</LandingEyebrow>
            <LandingHeading>Start with one course today.</LandingHeading>
            {!hasCourses ? (
              <p className="text-[15px] leading-relaxed text-muted-foreground">
                Browse the catalogue for published PharmEdge courses.
              </p>
            ) : null}
          </div>
          <Button
            asChild
            variant="outline"
            className="h-11 rounded-md border-primary px-6 font-medium text-primary hover:bg-primary hover:text-primary-foreground"
          >
            <Link href="/courses">Browse all courses</Link>
          </Button>
        </AnimatedSection>

        {hasCourses ? (
          <AnimatedStagger className="mt-10 grid grid-cols-1 gap-6 sm:mt-12 md:grid-cols-2 lg:grid-cols-3">
            {displayCourses.map((course) => (
              <AnimatedStaggerItem key={course.id}>
                <FeaturedCourseCard course={course} ctaLabel="View course" />
              </AnimatedStaggerItem>
            ))}
          </AnimatedStagger>
        ) : null}
      </LandingContainer>
    </section>
  );
}
