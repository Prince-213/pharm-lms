import { CoursesCatalogSection } from "@/components/courses/courses-catalog-section";
import { CoursesHeroSection } from "@/components/landing/courses-hero-section";
import React from "react";

const CoursesPage = () => {
  return (
    <div>
      <CoursesHeroSection />
      <CoursesCatalogSection />
    </div>
  );
};

export default CoursesPage;
