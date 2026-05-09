"use client";

import { usePathname } from "next/navigation";
import { MentorShell } from "@/components/mentor/mentor-shell";

export default function TutorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/tutor/login" || pathname === "/tutor/signup";
  const isCourseStudioRoute =
    pathname.startsWith("/tutor/courses/new") ||
    /\/tutor\/courses\/[^/]+\/manage/.test(pathname);

  if (isAuthRoute || isCourseStudioRoute) return children;

  return <MentorShell>{children}</MentorShell>;
}
