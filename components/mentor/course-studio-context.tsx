"use client";

import { createContext, type ReactNode, useContext } from "react";

type CourseStudioValue = {
  readOnly: boolean;
};

const CourseStudioContext = createContext<CourseStudioValue>({
  readOnly: false,
});

export function CourseStudioProvider({
  value,
  children,
}: {
  value: CourseStudioValue;
  children: ReactNode;
}) {
  return (
    <CourseStudioContext.Provider value={value}>
      {children}
    </CourseStudioContext.Provider>
  );
}

export function useCourseStudio() {
  return useContext(CourseStudioContext);
}
