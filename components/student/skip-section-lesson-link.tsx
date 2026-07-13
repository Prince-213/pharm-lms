"use client";

import Link from "next/link";
import { useState } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { cn } from "@/lib/utils";

export function SkipSectionLessonLink({
  href,
  children,
  className,
  shouldConfirm,
  currentSectionTitle,
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
  shouldConfirm: boolean;
  currentSectionTitle?: string;
}) {
  const [open, setOpen] = useState(false);

  if (!shouldConfirm) {
    return (
      <Link href={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <>
      <button
        type="button"
        className={cn("text-left", className)}
        onClick={() => setOpen(true)}
      >
        {children}
      </button>
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Skip ahead?</AlertDialogTitle>
            <AlertDialogDescription>
              {currentSectionTitle
                ? `"${currentSectionTitle}" has a section quiz you have not completed yet.`
                : "The current section has a quiz you have not completed yet."}{" "}
              You can continue, but finishing the quiz helps lock in what you learned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay here</AlertDialogCancel>
            <AlertDialogAction asChild>
              <Link href={href} onClick={() => setOpen(false)}>
                Continue anyway
              </Link>
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
