"use client";

import { clsx } from "clsx";
import Link from "next/link";
import { usePathname } from "next/navigation";

const tabs = [
  {
    href: "/student/dashboard",
    label: "My learning",
    isActive: (p: string) => p === "/student/dashboard",
  },
  {
    href: "/student/courses",
    label: "My courses",
    isActive: (p: string) =>
      p === "/student/courses" || p.startsWith("/student/courses/"),
  },
  {
    href: "/student/wishlist",
    label: "Wishlist",
    isActive: (p: string) =>
      p === "/student/wishlist" || p.startsWith("/student/wishlist/"),
  },
  {
    href: "/student/assignments",
    label: "Assignments",
    isActive: (p: string) =>
      p === "/student/assignments" || p.startsWith("/student/assignments/"),
  },
  {
    href: "/student/meetings",
    label: "Meetings",
    isActive: (p: string) =>
      p === "/student/meetings" || p.startsWith("/student/meetings/"),
  },
  {
    href: "/student/tutors",
    label: "Tutors",
    isActive: (p: string) =>
      p === "/student/tutors" || p.startsWith("/student/tutors/"),
  },
  {
    href: "/student/mentors",
    label: "Mentors",
    isActive: (p: string) =>
      p === "/student/mentors" || p.startsWith("/student/mentors/"),
  },
  {
    href: "/student/messages",
    label: "Messages",
    isActive: (p: string) =>
      p === "/student/messages" || p.startsWith("/student/messages/"),
  },
  {
    href: "/student/achievements",
    label: "Badges",
    isActive: (p: string) =>
      p === "/student/achievements" || p.startsWith("/student/achievements/"),
  },
] as const;

export function StudentSecondaryNav() {
  const pathname = usePathname();

  return (
    <nav
      className="flex gap-1 overflow-x-auto border-b border-[var(--border)] pb-px [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-2 [&::-webkit-scrollbar]:hidden"
      aria-label="Learning sections"
    >
      {tabs.map((tab) => {
        const active = tab.isActive(pathname);
        return (
          <Link
            key={tab.href}
            href={tab.href}
            aria-current={active ? "page" : undefined}
            className={clsx(
              "shrink-0 border-b-2 px-2 py-3 text-sm font-semibold transition-colors sm:px-3",
              active
                ? "border-[var(--primary)] text-[var(--foreground)]"
                : "border-transparent text-[var(--muted)] hover:text-[var(--foreground)]",
            )}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
