"use client";

import { type ReactNode, useState, useEffect } from "react";
import Link from "next/link";
import { BookOpen, Home, LayoutGrid, MessageSquare, Sparkles, Menu, X, ChevronRight, GraduationCap } from "lucide-react";
import { LogoutButton } from "@/components/auth/logout-button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/lib/student/progress-context";
import { useMemo } from "react";

const railLink =
  "flex h-11 w-11 items-center justify-center rounded-lg text-[var(--ink-mid)] transition hover:bg-slate-200/90 hover:text-[var(--primary)]";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { progressMap } = useProgress();

  const realTimePct = useMemo(() => {
    if (totalLessons === 0) return 0;
    const completed = Object.values(progressMap).filter(Boolean).length;
    return Math.round((completed / totalLessons) * 100);
  }, [progressMap, totalLessons]);

  const displayPct = Math.max(initialProgressPct, realTimePct);

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-[var(--foreground)]">
      <header className="fixed inset-x-0 top-0 z-[60] flex h-16 items-center justify-between gap-3 border-b border-white/10 bg-[var(--header)] px-3 text-[var(--header-fg)] shadow-lg sm:px-6">
        <div className="flex min-w-0 flex-1 items-center gap-2 sm:gap-4">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/10 text-[var(--header-fg)] lg:hidden hover:bg-white/20 transition-colors"
            title="Toggle curriculum"
          >
            {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          
          <Link
            href="/student/dashboard"
            className="flex items-center gap-2 font-display shrink-0 text-xs font-black uppercase tracking-[0.05em] text-[var(--header-fg)] sm:text-sm"
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white p-1.5 shadow-sm">
              <GraduationCap className="h-full w-full text-[var(--primary)]" />
            </div>
            <span className="hidden sm:inline">PharmLMS</span>
          </Link>
          
          <span className="hidden h-4 w-px shrink-0 bg-white/20 sm:block" aria-hidden />
          
          <div className="min-w-0">
            <h1 className="truncate font-display text-sm font-bold tracking-tight text-[var(--header-fg)] sm:text-base">
              {courseTitle}
            </h1>
            {lessonLine ? (
              <div className="flex items-center gap-1.5 opacity-80">
                <p className="truncate text-[10px] sm:text-xs">
                  {lessonLine}
                </p>
              </div>
            ) : null}
          </div>
        </div>
        
        <div className="flex shrink-0 items-center gap-2 sm:gap-4">
          <div className="hidden items-center gap-2 rounded-full bg-emerald-950/40 border border-emerald-400/20 px-3 py-1 sm:flex">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-100">
              Live learning
            </span>
          </div>
          
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center">
            <svg className="absolute inset-0 h-full w-full -rotate-90 transform">
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3"
                className="text-white/10"
              />
              <circle
                cx="20"
                cy="20"
                r="18"
                fill="transparent"
                stroke="currentColor"
                strokeWidth="3"
                strokeDasharray={`${2 * Math.PI * 18}`}
                strokeDashoffset={`${2 * Math.PI * 18 * (1 - displayPct / 100)}`}
                className="text-emerald-400 transition-all duration-700 ease-in-out"
              />
            </svg>
            <span className="text-[10px] font-black tracking-tighter text-[var(--header-fg)]">
              {displayPct}%
            </span>
          </div>
          
          <div className="hidden sm:block">
            <LogoutButton variant="onDark" />
          </div>
        </div>
      </header>

      <aside
        className="fixed bottom-0 left-0 top-16 z-50 hidden w-20 flex-col items-center gap-2 border-r border-[#e2e8f0] bg-[#f8fafc] py-5 md:flex"
        aria-label="Side rail"
      >
        <Link href="/student/dashboard" className={railLink} title="My learning">
          <Home className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <Link href="/student/browse" className={railLink} title="Browse catalog">
          <BookOpen className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <Link href="/student/courses" className={railLink} title="My courses">
          <LayoutGrid className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <div className="my-2 h-px w-8 bg-slate-200" />
        <Link href={`/student/course/${courseId}/forum`} className={railLink} title="Forum">
          <MessageSquare className="h-5 w-5" strokeWidth={2.2} />
        </Link>
        <Link href={`/student/course/${courseId}/ai-quiz`} className={railLink} title="AI quiz">
          <Sparkles className="h-5 w-5" strokeWidth={2.2} />
        </Link>
      </aside>

      {/* Mobile nav rail (Bottom) */}
      <nav className="fixed bottom-0 inset-x-0 z-50 flex h-16 items-center justify-around border-t border-slate-200 bg-white/95 backdrop-blur-md px-2 md:hidden">
        <Link href="/student/dashboard" className={cn(railLink, "h-12 w-12")} title="Home">
          <Home className="h-5 w-5" />
        </Link>
        <Link href="/student/browse" className={cn(railLink, "h-12 w-12")} title="Explore">
          <BookOpen className="h-5 w-5" />
        </Link>
        <button 
          onClick={() => setSidebarOpen(true)}
          className="flex h-12 w-12 -translate-y-4 items-center justify-center rounded-2xl bg-[var(--primary)] text-white shadow-lg shadow-[var(--primary)]/30 ring-4 ring-white"
        >
          <Menu className="h-6 w-6" />
        </button>
        <Link href={`/student/course/${courseId}/ai-quiz`} className={cn(railLink, "h-12 w-12")} title="AI Tool">
          <Sparkles className="h-5 w-5" />
        </Link>
        <Link href={`/student/course/${courseId}/forum`} className={cn(railLink, "h-12 w-12")} title="Forum">
          <MessageSquare className="h-5 w-5" />
        </Link>
      </nav>

      <main className="flex flex-1 flex-col pt-16 md:pl-20 pb-16 md:pb-0">
        <div className="flex h-full min-w-0 flex-1 flex-col lg:flex-row">
          {/* Main Stage (Video/Content) */}
          <div className="flex min-w-0 flex-1 flex-col">
            <div className="flex flex-1 flex-col bg-slate-900 overflow-hidden relative min-h-[50vh] lg:min-h-0">
              {childrenStage}
            </div>
            
            <div className="border-t border-slate-200 bg-white">
              {childrenLessonPanel}
            </div>
          </div>

          {/* Sidebar / Curriculum */}
          <aside 
            className={cn(
              "fixed inset-y-0 right-0 z-[70] w-full max-w-[350px] transform border-l border-slate-200 bg-white transition-transform duration-300 ease-in-out lg:relative lg:inset-y-auto lg:z-0 lg:block lg:translate-x-0",
              sidebarOpen ? "translate-x-0" : "translate-x-full"
            )}
          >
            {/* Close button for mobile sidebar */}
            <div className="flex h-16 items-center justify-between border-b border-slate-100 px-4 lg:hidden">
              <span className="font-bold text-slate-900">Course Outline</span>
              <button 
                onClick={() => setSidebarOpen(false)}
                className="rounded-lg bg-slate-100 p-2 text-slate-500 hover:bg-slate-200"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            
            <div className="h-[calc(100vh-4rem)] overflow-y-auto">
              {childrenSidebar}
            </div>
          </aside>
          
          {/* Mobile Overlay */}
          {sidebarOpen && (
            <div 
              className="fixed inset-0 z-[65] bg-slate-900/40 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </div>
      </main>
    </div>
  );
}
