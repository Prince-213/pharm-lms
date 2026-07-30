"use client";

import { type ReactNode, useState, useMemo, useEffect } from "react";
import Link from "next/link";
import {
  BookOpen,
  Home,
  LayoutGrid,
  MessageSquare,
  Sparkles,
  Menu,
  X,
  ChevronRight,
  GraduationCap,
  ListOrdered,
} from "lucide-react";
import { LogoutButton } from "@/auth/logout-button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/student/progress-context";
import { SimpleTooltip } from "@/components/ui/simple-tooltip";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { LabeledIconButton } from "@/components/student/labeled-icon-button";

// ─── Types ────────────────────────────────────────────────────────────────────

type RailLinkItem = {
  href: string;
  icon: React.ElementType;
  label: string;
};

// ─── Sub-components ────────────────────────────────────────────────────────────

function RailLink({
  href,
  icon: Icon,
  label,
  isActive = false,
}: RailLinkItem & { isActive?: boolean }) {
  return (
    <SimpleTooltip content={label} side="right">
      <Link
        href={href}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center rounded-xl transition-all duration-150 active:scale-95",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-soft)]",
          isActive
            ? "bg-white/10 text-white"
            : "text-slate-300/70 hover:bg-white/8 hover:text-white",
        )}
        aria-label={label}
      >
        {isActive && (
          <span
            className="absolute left-0 h-5 w-0.5 rounded-r-full bg-[var(--primary-soft)]"
            aria-hidden
          />
        )}
        <Icon className="h-5 w-5" strokeWidth={isActive ? 2.5 : 2} />
      </Link>
    </SimpleTooltip>
  );
}

function ProgressRing({ pct }: { pct: number }) {
  const r = 18;
  const circ = 2 * Math.PI * r;
  return (
    <SimpleTooltip content={`${pct}% complete`} side="bottom">
      <div className="relative flex h-10 w-10 shrink-0 cursor-default items-center justify-center">
        <svg className="absolute inset-0 h-full w-full -rotate-90">
          <circle
            cx={20}
            cy={20}
            r={r}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={3}
            className="text-white/10"
          />
          <circle
            cx={20}
            cy={20}
            r={r}
            fill="transparent"
            stroke="currentColor"
            strokeWidth={3}
            strokeDasharray={circ}
            strokeDashoffset={circ * (1 - pct / 100)}
            strokeLinecap="round"
            className="text-primary/80 transition-all duration-700 ease-in-out"
          />
        </svg>
        <span className="text-[10px] font-black tracking-tighter text-[var(--header-fg)]">
          {pct}%
        </span>
      </div>
    </SimpleTooltip>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────────

export function CourseSessionShell({
  courseTitle,
  lessonLine,
  progressPct: initialProgressPct,
  totalLessons,
  courseId,
  childrenStage,
  childrenLessonPanel,
  childrenSidebar,
}: {
  courseTitle: string;
  lessonLine: string | null;
  progressPct: number;
  totalLessons: number;
  courseId: string;
  childrenStage: ReactNode;
  childrenLessonPanel: ReactNode;
  childrenSidebar: ReactNode;
}) {
  const { progressMap } = useProgress();

  const realTimePct = useMemo(() => {
    if (totalLessons === 0) return 0;
    const completed = Object.values(progressMap).filter(Boolean).length;
    return Math.round((completed / totalLessons) * 100);
  }, [progressMap, totalLessons]);

  const displayPct = Math.max(initialProgressPct, realTimePct);

  const railItems: RailLinkItem[] = [
    { href: "/student/dashboard", icon: Home, label: "My learning" },
    { href: "/student/browse", icon: BookOpen, label: "Browse catalog" },
    { href: "/student/courses", icon: LayoutGrid, label: "My courses" },
  ];

  const courseRailItems: RailLinkItem[] = [
    {
      href: `/student/course/${courseId}?tab=forum`,
      icon: MessageSquare,
      label: "Course forum",
    },
    {
      href: `/student/course/${courseId}?tab=ai-quiz`,
      icon: Sparkles,
      label: "AI quiz generator",
    },
  ];

  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const main = document.querySelector("main");
    if (!main) return;
    const handleScroll = () => {
      setScrolled(main.scrollTop > 100);
    };
    main.addEventListener("scroll", handleScroll);
    return () => main.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <TooltipProvider>
      <div className="flex h-screen flex-col bg-[var(--background)] text-[var(--foreground)] overflow-hidden">
        {/* ─── Sleek Top Progress Bar ─── */}
        <div className="fixed top-0 left-0 right-0 z-[75] h-1 w-full bg-slate-100 md:pl-[60px]">
          <Progress
            value={displayPct}
            className="h-1 rounded-none bg-transparent"
          />
        </div>

        {/* ─── Fixed Top Header ─── */}
        <header
          className={cn(
            "fixed inset-x-0 top-0 z-[60] flex items-center justify-between gap-3 border-b border-white/8 bg-[var(--header)]/90 px-3 text-[var(--header-fg)] backdrop-blur-lg transition-all duration-300 sm:px-6 md:pl-20",
            scrolled ? "h-12 opacity-90 mt-0" : "h-16 mt-1",
          )}
        >
          <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
            <Link
              href="/student/dashboard"
              className="flex shrink-0 items-center gap-2 font-display text-xs font-black uppercase tracking-[0.05em] text-[var(--header-fg)] transition-opacity hover:opacity-80 sm:text-sm"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
                <GraduationCap className="h-full w-full text-[var(--primary)]" />
              </div>
              <span className="hidden sm:inline">PharmLMS</span>
            </Link>

            <span
              className="hidden h-4 w-px shrink-0 bg-white/20 sm:block"
              aria-hidden
            />

            <div className="min-w-0">
              <h1 className="truncate font-display text-sm font-bold tracking-tight text-[var(--header-fg)] sm:text-base">
                {courseTitle}
              </h1>
              {lessonLine && (
                <p className="truncate text-[10px] text-white/60 sm:text-xs">
                  {lessonLine}
                </p>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            {/* Mobile Contents Trigger */}
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 gap-2 border-white/20 bg-white/10 text-white hover:bg-white/20 lg:hidden"
                >
                  <ListOrdered className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wide">
                    Contents
                  </span>
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-[340px] p-0 border-l border-slate-200/50 bg-white/95 backdrop-blur-md"
              >
                <SheetHeader className="px-5 pt-6 pb-4 border-b border-slate-100">
                  <SheetTitle className="font-display text-base font-bold text-slate-800">
                    Course Curriculum
                  </SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full">
                  <div className="pb-20">{childrenSidebar}</div>
                </ScrollArea>
              </SheetContent>
            </Sheet>

            <div className="hidden items-center gap-1.5 rounded-full border border-primary/20 bg-primary/20 px-3 py-1 sm:flex">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-primary/100" />
              </span>
              <span className="text-[10px] font-black uppercase tracking-widest text-primary-foreground/90">
                Live
              </span>
            </div>

            <ProgressRing pct={displayPct} />

            <div className="hidden sm:block">
              <LogoutButton variant="onDark" />
            </div>
          </div>
        </header>

        {/* ─── Desktop Left Rail ─── */}
        <aside
          className="fixed bottom-0 left-0 top-0 z-[65] hidden w-[60px] flex-col items-center gap-1.5 overflow-y-auto border-r border-white/6 bg-[var(--header)] py-8 md:flex"
          aria-label="Course navigation rail"
        >
          {railItems.map((item) => (
            <RailLink key={item.href} {...item} />
          ))}

          <span
            className="my-2.5 h-px w-8 rounded-full bg-white/10"
            aria-hidden
          />

          {courseRailItems.map((item) => (
            <RailLink key={item.href} {...item} />
          ))}
        </aside>

        {/* ─── Main Content ─── */}
        <main className="flex flex-1 overflow-hidden pt-16 md:pl-[60px]">
          <div className="flex flex-1 min-w-0 lg:flex-row">
            <div className="flex min-w-0 flex-1 flex-col overflow-y-auto">
              <div className="relative w-full bg-slate-900">
                {childrenStage}
              </div>

              <div className="border-t border-[#d1d7dc] bg-white pb-20 lg:pb-0">
                {childrenLessonPanel}
              </div>
            </div>

            {/* ─── Desktop Curriculum Sidebar ─── */}
            <aside className="hidden lg:flex h-full w-[440px] min-w-[440px] shrink-0 flex-col overflow-x-hidden border-l border-border bg-card xl:w-[460px] xl:min-w-[460px]">
              <ScrollArea className="min-w-0 flex-1">
                <div className="min-h-0 min-w-0 overflow-x-hidden">{childrenSidebar}</div>
              </ScrollArea>
            </aside>
          </div>
        </main>

        {/* Mobile Control Bar - Placeholder for Next/Prev/Complete which are currently in page.tsx stage and panel */}
        {/* We will hide the old mobile rail and use this if needed, or stick to the stage controls */}
        <nav
          className="fixed inset-x-0 bottom-0 z-50 flex h-[4.5rem] items-end justify-around border-t border-slate-200/80 bg-white/95 px-1 pb-1 backdrop-blur-md md:hidden"
          aria-label="Mobile navigation"
        >
          <LabeledIconButton
            icon={Home}
            label="Home"
            layout="stacked"
            href="/student/dashboard"
            className="text-slate-500"
          />
          <LabeledIconButton
            icon={LayoutGrid}
            label="Courses"
            layout="stacked"
            href="/student/courses"
            className="text-slate-500"
          />

          <Sheet>
            <SheetTrigger asChild>
              <button
                type="button"
                className="-mt-5 flex min-w-[3.5rem] flex-col items-center gap-0.5 rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2"
                aria-label="Open course lessons"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 ring-4 ring-white transition active:scale-95">
                  <ListOrdered className="h-6 w-6" aria-hidden />
                </span>
                <span className="text-[10px] font-semibold leading-none text-[var(--primary-strong)]">
                  Lessons
                </span>
              </button>
            </SheetTrigger>
            <SheetContent
              side="bottom"
              className="h-[80vh] rounded-t-3xl border-t border-slate-200/50 bg-white/95 backdrop-blur-lg p-0"
            >
              <SheetHeader className="px-6 pt-6 pb-2">
                <SheetTitle className="font-display text-lg font-bold">
                  Curriculum
                </SheetTitle>
              </SheetHeader>
              <ScrollArea className="h-full px-2">
                <div className="pb-32">{childrenSidebar}</div>
              </ScrollArea>
            </SheetContent>
          </Sheet>

          <LabeledIconButton
            icon={Sparkles}
            label="AI Quiz"
            layout="stacked"
            href={`/student/course/${courseId}?tab=ai-quiz`}
            className="text-slate-500"
          />
          <LabeledIconButton
            icon={MessageSquare}
            label="Forum"
            layout="stacked"
            href={`/student/course/${courseId}?tab=forum`}
            className="text-slate-500"
          />
        </nav>
      </div>
    </TooltipProvider>
  );
}
