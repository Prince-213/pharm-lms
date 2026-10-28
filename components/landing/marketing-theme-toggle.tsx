"use client";

import { Moon, Sun } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import {
  MOTION_EASE,
  usePrefersReducedMotion,
} from "@/components/landing/motion-primitives";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  applyMarketingTheme,
  getResolvedMarketingTheme,
  getStoredMarketingTheme,
  type MarketingTheme,
  markMarketingThemeReady,
  toggleMarketingTheme,
} from "@/lib/marketing-theme";

function useMarketingTheme() {
  const [theme, setTheme] = useState<MarketingTheme>("light");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const sync = () => setTheme(getResolvedMarketingTheme());
    sync();
    applyMarketingTheme(getStoredMarketingTheme());
    const frame = window.requestAnimationFrame(() => {
      markMarketingThemeReady();
      setReady(true);
    });

    const media = window.matchMedia("(prefers-color-scheme: dark)");
    const onSystemChange = () => {
      if (getStoredMarketingTheme()) return;
      applyMarketingTheme(null);
      setTheme(getResolvedMarketingTheme());
    };
    media.addEventListener("change", onSystemChange);
    return () => {
      window.cancelAnimationFrame(frame);
      media.removeEventListener("change", onSystemChange);
    };
  }, []);

  const onToggle = () => {
    setTheme(toggleMarketingTheme());
  };

  return { theme, ready, onToggle };
}

export function MarketingThemeToggle() {
  const { theme, ready, onToggle } = useMarketingTheme();
  const reducedMotion = usePrefersReducedMotion();

  const isDark = theme === "dark";
  const actionLabel = isDark ? "Switch to light mode" : "Switch to dark mode";
  const tipLabel = isDark ? "Light mode" : "Dark mode";
  const duration = reducedMotion ? 0 : 0.28;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={onToggle}
          aria-label={actionLabel}
          className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-md text-white/90 transition-colors hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar"
        >
          <span className="relative block size-5">
            {ready ? (
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  key={isDark ? "sun" : "moon"}
                  className="absolute inset-0 flex items-center justify-center"
                  initial={
                    reducedMotion
                      ? false
                      : { opacity: 0, rotate: -180, scale: 0.6 }
                  }
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  exit={
                    reducedMotion
                      ? { opacity: 0 }
                      : { opacity: 0, rotate: 180, scale: 0.6 }
                  }
                  transition={{ duration, ease: MOTION_EASE }}
                >
                  {isDark ? (
                    <Sun size={20} weight="duotone" aria-hidden />
                  ) : (
                    <Moon size={20} weight="duotone" aria-hidden />
                  )}
                </motion.span>
              </AnimatePresence>
            ) : null}
          </span>
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom" sideOffset={8}>
        {tipLabel}
      </TooltipContent>
    </Tooltip>
  );
}
