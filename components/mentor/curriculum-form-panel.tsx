"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  closeDisabled = false,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: ReactNode;
  closeDisabled?: boolean;
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
        <Sheet open={open} onOpenChange={(v) => !v && !closeDisabled && onClose()}>
          <SheetContent
            side="bottom"
            className="flex h-[min(92dvh,720px)] flex-col gap-0 rounded-t-2xl border-t p-0"
          >
            <SheetHeader className="shrink-0 space-y-1 border-b border-border px-4 py-4 text-left">
              <SheetTitle className="text-base font-semibold">{title}</SheetTitle>
              {description ? (
                <SheetDescription className="text-left text-sm">
                  {description}
                </SheetDescription>
              ) : null}
            </SheetHeader>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-5">
              {children}
            </div>
          </SheetContent>
        </Sheet>
      ) : null}

      {open && isDesktop ? (
        <div ref={inlineRef}>
          <Card
            className={cn("mt-5 border-[#d1d7dc] shadow-sm")}
          >
          <CardHeader className="relative border-b border-[#d1d7dc] pb-4">
            <CardTitle className="pr-10 text-base">{title}</CardTitle>
            {description ? (
              <CardDescription>{description}</CardDescription>
            ) : null}
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="absolute top-4 right-4 text-muted-foreground"
              onClick={onClose}
              disabled={closeDisabled}
              aria-label="Close panel"
            >
              <X className="size-4" />
            </Button>
          </CardHeader>
          <CardContent className="space-y-4 pt-4">{children}</CardContent>
        </Card>
        </div>
      ) : null}
    </>
  );
}
