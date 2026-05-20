"use client";

import { useEffect, useRef, type ReactNode } from "react";
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

  useEffect(() => {
    if (!open) return;
    const isDesktop = window.matchMedia("(min-width: 1024px)").matches;
    if (isDesktop) {
      inlineRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [open]);

  return (
    <>
      <Sheet open={open} onOpenChange={(v) => !v && onClose()}>
        <SheetContent
          side="bottom"
          className="flex h-[min(92dvh,720px)] flex-col gap-0 rounded-t-2xl border-t p-0 lg:hidden"
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

      {open ? (
        <div
          ref={inlineRef}
          className={cn(
            "mt-4 hidden rounded-xl border border-[var(--primary)]/20 bg-white shadow-sm lg:block",
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
