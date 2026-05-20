"use client";

import Link from "next/link";
import { useState } from "react";
import { CourseManageSidebar } from "@/components/mentor/course-manage-sidebar";
import { InstructorCourseHeader } from "@/components/mentor/instructor-course-header";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { CourseStatus } from "@/generated/prisma/enums";

export function CourseManageFrame({
  courseId,
  courseTitle,
  statusLabel,
  courseStatus,
  readOnly = false,
  settingsHref,
  children,
}: {
  courseId: string;
  courseTitle: string;
  statusLabel: string;
  courseStatus: CourseStatus;
  readOnly?: boolean;
  settingsHref?: string;
  children: React.ReactNode;
}) {
  const [navOpen, setNavOpen] = useState(false);

  return (
    <>
      <InstructorCourseHeader
        courseId={courseId}
        courseTitle={courseTitle}
        statusLabel={statusLabel}
        readOnly={readOnly}
        settingsHref={settingsHref}
        onMenuClick={() => setNavOpen(true)}
      />

      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1280px] bg-[var(--surface)] lg:min-h-[calc(100vh-3rem)]">
        <aside className="sticky top-12 hidden h-[calc(100vh-3rem)] w-[230px] shrink-0 flex-col overflow-hidden border-r border-[var(--border)] bg-[var(--surface)] lg:flex">
          <CourseManageSidebar
            courseId={courseId}
            courseStatus={courseStatus}
            className="h-full p-6"
          />
        </aside>

        <Sheet open={navOpen} onOpenChange={setNavOpen}>
          <SheetContent
            side="left"
            className="flex w-[min(100vw,280px)] flex-col gap-0 p-0 sm:max-w-[280px]"
          >
            <SheetHeader className="shrink-0 space-y-2 border-b border-[var(--border)] px-4 py-4 text-left">
              <SheetTitle className="text-base font-bold text-[var(--foreground)]">
                Course planner
              </SheetTitle>
              <Link
                href="/tutor/courses"
                onClick={() => setNavOpen(false)}
                className="text-xs font-medium text-[var(--muted)] transition hover:text-[var(--foreground)]"
              >
                {"<"} Back to courses
              </Link>
              {readOnly ? (
                <p className="text-xs font-medium text-amber-800">
                  Editing is locked for this course.
                </p>
              ) : null}
            </SheetHeader>
            <CourseManageSidebar
              courseId={courseId}
              courseStatus={courseStatus}
              onNavigate={() => setNavOpen(false)}
              className="min-h-0 flex-1 px-4 pb-6 pt-4"
            />
          </SheetContent>
        </Sheet>

        <main className="min-w-0 flex-1 bg-[var(--surface-muted)] p-3 sm:p-4 lg:p-6">
          {children}
        </main>
      </div>
    </>
  );
}
