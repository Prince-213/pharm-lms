"use client";

import { MoreVertical, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { unenrollFromCourseAction } from "@/app/student/actions/enrollment";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function EnrolledCourseMenu({
  courseId,
  courseTitle,
}: {
  courseId: string;
  courseTitle: string;
}) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!confirming) return;
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setConfirming(false);
        setError(null);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [confirming]);

  function handleUnenroll() {
    setError(null);
    startTransition(async () => {
      const result = await unenrollFromCourseAction(courseId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setConfirming(false);
      router.refresh();
    });
  }

  if (confirming) {
    return (
      <div
        ref={containerRef}
        className="absolute right-2 top-2 z-20 w-56 rounded-lg border border-border bg-card p-3 text-sm shadow-lg"
      >
        <p className="text-xs text-foreground">
          Unenroll from <strong>{courseTitle}</strong>? Your progress will be
          saved if you re-enroll later.
        </p>
        {error ? (
          <p className="mt-2 text-xs font-medium text-destructive">{error}</p>
        ) : null}
        <div className="mt-3 flex justify-end gap-2">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              setConfirming(false);
              setError(null);
            }}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="destructive"
            size="sm"
            onClick={handleUnenroll}
            disabled={pending}
          >
            <Trash2 className="h-3 w-3" />
            {pending ? "Removing…" : "Unenroll"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="absolute right-2 top-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="secondary"
            size="icon-sm"
            aria-label={`Options for ${courseTitle}`}
            className="rounded-full bg-background/95 shadow-sm"
          >
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            variant="destructive"
            onSelect={() => setConfirming(true)}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Unenroll from course
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
