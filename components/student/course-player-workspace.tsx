"use client";

import { type ReactNode, useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CourseLessonActionGroup } from "@/components/student/course-lesson-action-group";
import { CourseSessionShell } from "@/components/student/course-session-shell";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { buildCoursePlayerHref } from "@/lib/student/course-player-href";

const TAB_ITEMS = [
  ["overview", "Overview"],
  ["notes", "Notes"],
  ["announcements", "Announcements"],
  ["forum", "Forums"],
  ["ai-quiz", "AI Quiz"],
  ["reviews", "Reviews"],
] as const;

const VALID_TABS = new Set(TAB_ITEMS.map(([id]) => id));

function normalizeTab(raw: string | null | undefined, fallback: string) {
  if (raw && VALID_TABS.has(raw as (typeof TAB_ITEMS)[number][0])) return raw;
  return fallback;
}

type SectionQuiz = {
  id: string;
  title: string;
  questions: unknown;
};

export function CoursePlayerWorkspace({
  initialTab,
  courseId,
  lessonId,
  stage,
  courseTitle,
  lessonLine,
  progressPct,
  totalLessons,
  sidebar,
  completionCta,
  actionGroup,
  tabPanels,
}: {
  initialTab: string;
  courseId: string;
  lessonId: string;
  stage: ReactNode;
  courseTitle: string;
  lessonLine: string | null;
  progressPct: number;
  totalLessons: number;
  sidebar: ReactNode;
  completionCta: ReactNode;
  actionGroup: {
    initialCompleted: boolean;
    quizzes: SectionQuiz[];
  };
  tabPanels: {
    overview: ReactNode;
    notes: ReactNode;
    announcements: ReactNode;
    forum: ReactNode;
    aiQuiz: ReactNode;
    reviews: ReactNode;
  };
}) {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState(() =>
    normalizeTab(initialTab, "overview"),
  );

  useEffect(() => {
    const fromUrl = normalizeTab(searchParams.get("tab"), "overview");
    setActiveTab(fromUrl);
  }, [searchParams]);

  const onTabChange = useCallback(
    (tab: string) => {
      setActiveTab(tab);
      const href = buildCoursePlayerHref(courseId, lessonId, tab);
      window.history.replaceState(null, "", href);
      requestAnimationFrame(() => {
        document
          .getElementById("course-tab-panel")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    },
    [courseId, lessonId],
  );

  const showStage = activeTab === "overview";

  const lessonPanel = (
    <>
      <div className="bg-white">
        <div className="mx-auto max-w-4xl border-b border-border py-3 sm:py-4 px-4 sm:px-6">
          {completionCta}
        </div>

        <Tabs
          value={activeTab}
          onValueChange={onTabChange}
          className="mx-auto max-w-4xl"
        >
          <div
            id="curriculum-tabs"
            className="border-b border-border px-4 sm:px-6"
          >
            <TabsList
              variant="line"
              className="h-auto w-full justify-start gap-1 overflow-x-auto bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {TAB_ITEMS.map(([id, label]) => (
                <TabsTrigger
                  key={id}
                  value={id}
                  className="shrink-0 px-3 py-2.5 text-sm font-medium data-[state=active]:text-primary"
                >
                  {label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>

          <div
            id="course-tab-panel"
            className="px-4 pt-6 pb-8 sm:px-8 sm:py-8"
          >
            <div className="relative mx-auto min-h-[50vh] max-w-4xl">
              <TabsContent value="overview" className="mt-0 outline-none">
                {tabPanels.overview}
              </TabsContent>
              <TabsContent value="notes" className="mt-0 outline-none">
                {tabPanels.notes}
              </TabsContent>
              <TabsContent value="announcements" className="mt-0 outline-none">
                {tabPanels.announcements}
              </TabsContent>
              <TabsContent value="forum" className="mt-0 outline-none">
                {tabPanels.forum}
              </TabsContent>
              <TabsContent value="ai-quiz" className="mt-0 outline-none">
                {tabPanels.aiQuiz}
              </TabsContent>
              <TabsContent value="reviews" className="mt-0 outline-none">
                {tabPanels.reviews}
              </TabsContent>

              <CourseLessonActionGroup
                courseId={courseId}
                lessonId={lessonId}
                initialCompleted={actionGroup.initialCompleted}
                quizzes={actionGroup.quizzes}
              />
            </div>
          </div>
        </Tabs>
      </div>
    </>
  );

  return (
    <CourseSessionShell
      courseTitle={courseTitle}
      lessonLine={lessonLine}
      progressPct={progressPct}
      totalLessons={totalLessons}
      courseId={courseId}
      childrenStage={showStage ? stage : null}
      childrenLessonPanel={lessonPanel}
      childrenSidebar={sidebar}
    />
  );
}
