"use client";

import { motion, useInView } from "motion/react";
import { type ReactNode, useEffect, useRef, useState } from "react";

export const MOTION_EASE = [0.25, 0.1, 0.25, 1] as const;
export const MOTION_VIEWPORT = { once: true, margin: "-60px" } as const;

export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, []);

  return reduced;
}

type Direction = "up" | "left" | "right";

function getDirectionOffset(direction: Direction): { x: number; y: number } {
  switch (direction) {
    case "left":
      return { x: -32, y: 0 };
    case "right":
      return { x: 32, y: 0 };
    default:
      return { x: 0, y: 32 };
  }
}

type AnimatedSectionProps = {
  children: ReactNode;
  delay?: number;
  className?: string;
  direction?: Direction;
};

export function AnimatedSection({
  children,
  delay = 0,
  className,
  direction = "up",
}: AnimatedSectionProps) {
  const reduced = usePrefersReducedMotion();
  const offset = getDirectionOffset(direction);

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0, x: offset.x, y: offset.y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={MOTION_VIEWPORT}
      transition={{
        duration: 0.6,
        delay,
        ease: MOTION_EASE,
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type AnimatedStaggerProps = {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delayChildren?: number;
};

export function AnimatedStagger({
  children,
  className,
  stagger = 0.08,
  delayChildren = 0,
}: AnimatedStaggerProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={MOTION_VIEWPORT}
      variants={{
        hidden: {},
        visible: {
          transition: { staggerChildren: stagger, delayChildren },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

type AnimatedStaggerItemProps = {
  children: ReactNode;
  className?: string;
};

export function AnimatedStaggerItem({
  children,
  className,
}: AnimatedStaggerItemProps) {
  const reduced = usePrefersReducedMotion();

  if (reduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 24 },
        visible: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.5, ease: MOTION_EASE },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function parseStatValue(value: string): {
  target: number;
  format: (n: number) => string;
} {
  const trimmed = value.trim();
  const hasPlus = trimmed.endsWith("+");
  const core = hasPlus ? trimmed.slice(0, -1) : trimmed;

  if (core.endsWith("M")) {
    const num = Number.parseFloat(core.slice(0, -1));
    return {
      target: num,
      format: (n) => `${n.toFixed(1)}M${hasPlus ? "+" : ""}`,
    };
  }

  if (core.endsWith("K")) {
    const num = Number.parseFloat(core.slice(0, -1));
    return {
      target: num,
      format: (n) => `${Math.round(n)}K${hasPlus ? "+" : ""}`,
    };
  }

  const num = Number.parseFloat(core);
  return {
    target: num,
    format: (n) => `${Math.round(n)}${hasPlus ? "+" : ""}`,
  };
}

type AnimatedCounterProps = {
  value: string;
  className?: string;
  duration?: number;
};

export function AnimatedCounter({
  value,
  className,
  duration = 1.2,
}: AnimatedCounterProps) {
  const reduced = usePrefersReducedMotion();
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, MOTION_VIEWPORT);
  const { target, format } = parseStatValue(value);
  const [display, setDisplay] = useState(reduced ? value : format(0));

  useEffect(() => {
    if (reduced) {
      setDisplay(value);
      return;
    }
    if (!inView) return;

    let start: number | null = null;
    let frame = 0;

    const step = (ts: number) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / (duration * 1000), 1);
      const eased = 1 - (1 - progress) ** 3;
      setDisplay(format(target * eased));
      if (progress < 1) {
        frame = requestAnimationFrame(step);
      }
    };

    frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [duration, format, inView, reduced, target, value]);

  return (
    <span ref={ref} className={className}>
      {display}
    </span>
  );
}
