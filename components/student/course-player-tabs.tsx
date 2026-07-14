"use client";

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";

const TABS = [
  ["overview", "Overview"],
  ["notes", "Notes"],
  ["announcements", "Announcements"],
  ["forum", "Forums"],
  ["ai-quiz", "AI Quiz"],
  ["reviews", "Reviews"],
] as const;

export function CoursePlayerTabs({
  activeTab,
  onTabChange,
  className,
}: {
  courseId?: string;
  lessonId?: string | null;
  activeTab: string;
  onTabChange: (tab: string) => void;
  className?: string;
}) {
  return (
    <Tabs
      value={activeTab}
      className={cn("min-w-0 flex-1", className)}
      onValueChange={onTabChange}
    >
      <TabsList
        variant="line"
        className="h-auto w-full justify-start gap-0 overflow-x-auto rounded-none bg-transparent p-0 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map(([id, label]) => (
          <TabsTrigger
            key={id}
            value={id}
            className="shrink-0 rounded-none px-3 py-3 text-xs font-semibold uppercase tracking-[0.05em] text-muted-foreground data-[state=active]:text-primary data-[state=active]:after:bg-primary"
          >
            {label}
          </TabsTrigger>
        ))}
      </TabsList>
    </Tabs>
  );
}
