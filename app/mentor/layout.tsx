"use client";

import { usePathname } from "next/navigation";
import { MentorPortalShell } from "@/components/mentor/mentor-portal-shell";

export default function MentorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute = pathname === "/mentor/login" || pathname === "/mentor/signup";
  if (isAuthRoute) return children;

  return <MentorPortalShell>{children}</MentorPortalShell>;
}
