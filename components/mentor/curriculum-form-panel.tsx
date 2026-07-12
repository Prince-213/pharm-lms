"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

export function CurriculumFormPanel({
  open,
  onClose,
  title,
  description,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  const inlineRef = useRef<HTMLDivElement>(null);
  const [isDesktop, setIsDesktop] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!open || !isDesktop) return;
    inlineRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [open, isDesktop]);

  return (
    <>
      {!isDesktop ? (
        <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
          <SheetContent
            side="bottom"
            className="flex h-[min(92dvh,720px)] flex-col gap-0 rounded-t-2xl border-t p-0"
          >
            <SheetHeader className="shrink-0 space-y-1 border-b border-[var(--border)] px-4 py-4 text-left">
              <SheetTitle className="text-base font-bold text-[var(--foreground)]">
                {title}
              </SheetTitle>
              {description ? (
                <SheetDescription className="text-left text-xs text-[var(--muted)]">
                  {description}
                </SheetDescription>
              ) : null}
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      ) : null}

      {open && isDesktop ? (
        <div
          ref={inlineRef}
          className={cn(
            "mt-4 rounded-xl border border-[var(--primary)]/20 bg-white shadow-sm",
          )}
        >
          <div className="border-b border-[var(--border)] px-4 py-3">
            <h3 className="text-sm font-bold text-[var(--foreground)]">{title}</h3>
            {description ? (
              <p className="mt-1 text-xs text-[var(--muted)]">{description}</p>
            ) : null}
          </div>
          <div className="p-4">{children}</div>
        </div>
      ) : null}
    </>
  );
}
