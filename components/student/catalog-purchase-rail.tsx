"use client";

import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Sticky purchase column inside AppShell's scrollable `<main>`.
 * Subtle shadow when the user has scrolled the main region (couples to AppShell layout).
 */
export function CatalogPurchaseRail({
  children,
}: {
  children: React.ReactNode;
}) {
  const [scrolledMain, setScrolledMain] = useState(false);

  useEffect(() => {
    const scrollRoot = document.querySelector("main");
    if (!(scrollRoot instanceof HTMLElement)) return;
    const el = scrollRoot;

    function onScroll() {
      setScrolledMain(el.scrollTop > 32);
    }

    el.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className={cn("space-y-4 lg:sticky lg:z-20 lg:self-start", "lg:top-24")}
    >
      <div
        className={cn(
          "rounded-sm transition-[box-shadow,ring-color] duration-300 ease-out motion-reduce:transition-none",
          scrolledMain
            ? "lg:shadow-[0_8px_24px_rgba(0,0,0,0.12),0_2px_8px_rgba(0,0,0,0.08)] lg:ring-1 lg:ring-black/8"
            : "lg:shadow-[0_2px_8px_rgba(0,0,0,0.06)]",
        )}
      >
        {children}
      </div>
    </div>
  );
}
