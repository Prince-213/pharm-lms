"use client";

import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import {
  BookOpen,
  GraduationCap,
  Search,
  Heart,
  Calendar,
  Award,
  Trophy,
  Users,
} from "lucide-react";

const nav = [
  { href: "/student/dashboard", label: "My learning", icon: BookOpen },
  { href: "/student/courses", label: "My courses", icon: GraduationCap },
  { href: "/student/browse", label: "Browse", icon: Search },
  { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/student/wishlist", label: "Wishlist", icon: Heart },
  { href: "/student/meetings", label: "Meetings", icon: Calendar },
  { href: "/student/mentors", label: "Mentors", icon: Users },
  { href: "/student/achievements", label: "Badges", icon: Award },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isAuthRoute =
    pathname === "/student/login" || pathname === "/student/signup";

  const isLearningPlayer = /^\/student\/course\/[^/]+$/.test(pathname);

  if (isAuthRoute) return children;

  /* Figma session screen: full chrome is rendered on the course player page */
  if (isLearningPlayer) return <>{children}</>;

  return (
    <>
      <AppShell
        title="STUDENT DASHBOARD"
        subtitle="Browse the catalog, read course pages, enroll, and learn section by section."
        nav={nav}
        homeHref="/student/dashboard"
      >
        {children}
      </AppShell>
    </>
  );
}
