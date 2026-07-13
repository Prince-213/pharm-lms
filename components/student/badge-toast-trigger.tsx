"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";
import { BadgeEarnedToast } from "./badge-earned-toast";

type Badge = { id: string; name: string; iconUrl: string | null };

const CONFETTI_COLORS = ["#1e40af", "#dbeafe", "#1e3a8a", "#eff6ff", "#facc15"];

export function BadgeToastTrigger({ newBadges }: { newBadges: Badge[] }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current || newBadges.length === 0) return;
    fired.current = true;

    newBadges.forEach((badge, i) => {
      setTimeout(() => {
        toast.custom(
          (t) => <BadgeEarnedToast toastId={t} badge={badge} />,
          {
            duration: 6500,
            id: `badge-earned-${badge.id}`,
          },
        );

        void import("canvas-confetti").then(({ default: confetti }) => {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { x: 0.88, y: 0.85 },
            colors: CONFETTI_COLORS,
            gravity: 1.1,
            scalar: 0.85,
            ticks: 200,
          });
        });
      }, i * 900);
    });
  }, [newBadges]);

  return null;
}
