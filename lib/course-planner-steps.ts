export type CoursePlannerItem = {
  label: string;
  href: (courseId: string) => string;
  segment: string;
};

export type CoursePlannerSection = {
  title: string;
  items: CoursePlannerItem[];
};

export const COURSE_PLANNER_SECTIONS: CoursePlannerSection[] = [
  {
    title: "Plan your course",
    items: [
      {
        label: "Course structure",
        href: (courseId) => `/tutor/courses/${courseId}/manage/structure`,
        segment: "structure",
      },
      {
        label: "Setup & test video",
        href: (courseId) => `/tutor/courses/${courseId}/manage/video`,
        segment: "video",
      },
    ],
  },
  {
    title: "Create your content",
    items: [
      {
        label: "Film & edit",
        href: (courseId) => `/tutor/courses/${courseId}/manage/film`,
        segment: "film",
      },
      {
        label: "Curriculum",
        href: (courseId) => `/tutor/courses/${courseId}/manage/curriculum`,
        segment: "curriculum",
      },
    ],
  },
  {
    title: "Publish your course",
    items: [
      {
        label: "Course landing page",
        href: (courseId) => `/tutor/courses/${courseId}/manage/basics`,
        segment: "basics",
      },
      {
        label: "Pricing",
        href: (courseId) => `/tutor/courses/${courseId}/manage/pricing`,
        segment: "pricing",
      },
      {
        label: "Course messages",
        href: (courseId) => `/tutor/courses/${courseId}/manage/messages`,
        segment: "messages",
      },
    ],
  },
];

/** Flat ordered list of planner steps for Back/Next navigation. */
export const COURSE_PLANNER_STEPS: CoursePlannerItem[] =
  COURSE_PLANNER_SECTIONS.flatMap((section) => section.items);

export function activePlannerSegment(pathname: string): string {
  const parts = pathname.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? "";
}

export function getPlannerStepIndex(segment: string): number {
  return COURSE_PLANNER_STEPS.findIndex((step) => step.segment === segment);
}

export function getPlannerStepBySegment(
  segment: string,
): CoursePlannerItem | undefined {
  return COURSE_PLANNER_STEPS.find((step) => step.segment === segment);
}

export function getPrevNextPlannerStep(
  courseId: string,
  segment: string,
): {
  prev: { href: string; label: string } | null;
  next: { href: string; label: string } | null;
  index: number;
} {
  const index = getPlannerStepIndex(segment);
  if (index < 0) {
    return { prev: null, next: null, index: -1 };
  }
  const prevStep = index > 0 ? COURSE_PLANNER_STEPS[index - 1] : null;
  const nextStep =
    index < COURSE_PLANNER_STEPS.length - 1
      ? COURSE_PLANNER_STEPS[index + 1]
      : null;
  return {
    index,
    prev: prevStep
      ? { href: prevStep.href(courseId), label: prevStep.label }
      : null,
    next: nextStep
      ? { href: nextStep.href(courseId), label: nextStep.label }
      : null,
  };
}
