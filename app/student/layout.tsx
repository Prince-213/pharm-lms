"use client";

import {
  Award,
  BookOpen,
  Calendar,
  ClipboardText as ClipboardList,
  GraduationCap,
  Heart,
  School,
  Search,
  Trophy,
  User,
  Users,
} from "@/lib/icons/client";
import { usePathname } from "next/navigation";
import { AppShell } from "@/components/app-shell";

function normalizePathname(pathname: string | null): string {
  if (!pathname) return "";
  const trimmed = pathname.replace(/\/$/, "");
  return trimmed.length === 0 ? "/" : trimmed;
}

const navGroups = [
  {
    label: "Workspace",
    items: [
      { href: "/student/dashboard", label: "My learning", icon: BookOpen },
      { href: "/student/courses", label: "My courses", icon: GraduationCap },
      { href: "/student/browse", label: "Browse", icon: Search },
      {
        href: "/student/assignments",
        label: "Assignments",
        icon: ClipboardList,
      },
      { href: "/student/leaderboard", label: "Leaderboard", icon: Trophy },
    ],
  },
  {
    label: "Personal",
    items: [
      { href: "/student/profile", label: "Profile", icon: User },
      { href: "/student/wishlist", label: "Wishlist", icon: Heart },
      { href: "/student/meetings", label: "Meetings", icon: Calendar },
      { href: "/student/tutors", label: "Tutors", icon: School },
      { href: "/student/mentors", label: "Mentors", icon: Users },
      { href: "/student/achievements", label: "Badges", icon: Award },
    ],
  },
];

export default function StudentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const path = normalizePathname(pathname);
  const isAuthRoute = path === "/student/login" || path === "/student/signup";

  const isLearningPlayer = /^\/student\/course\/[^/]+$/.test(path);
  const isCertificatePage = /^\/student\/course\/[^/]+\/certificate$/.test(path);

  if (isAuthRoute) return children;

  /* Figma session screen: full chrome is rendered on the course player page */
  if (isLearningPlayer || isCertificatePage) return <>{children}</>;

  return (
    <AppShell
      title="Student"
      subtitle="Browse the catalog, read course pages, enroll, and learn section by section."
      navGroups={navGroups}
      homeHref="/student/dashboard"
    >
      {children}
    </AppShell>
  );
}
