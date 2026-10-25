"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ChevronDown, Search, X } from "lucide-react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import { Button } from "@/components/ui/button";
import {
  AnimatedCounter,
  AnimatedStagger,
  AnimatedStaggerItem,
  MOTION_EASE,
  MOTION_VIEWPORT,
  usePrefersReducedMotion,
} from "@/components/landing/motion-primitives";

type SearchResult = {
  id: string;
  title: string;
  thumbnailUrl: string | null;
  mentorName: string;
  priceMinorUnits: number | null;
  priceCurrency: string;
};

const categories = [
  "All categories",
  "Data and analytics",
  "Pharmacovigilance",
  "Clinical pharmacology",
  "Licensing prep",
];

const popularSearches = [
  "Excel for pharmacy",
  "Power BI",
  "Pharmacokinetics",
  "Pharmacovigilance",
];

const stats = [
  { value: "~130", label: "Guided learning hours" },
  { value: "6 levels", label: "One badge earned at each" },
  { value: "6+", label: "Portfolio projects" },
  { value: "7+", label: "African countries in the community" },
];

const pathwaySteps = [
  {
    state: "done" as const,
    title: "Foundations of Data in Pharmacy",
    meta: "Level 1 · Excel · Badge earned",
  },
  {
    state: "done" as const,
    title: "Data Analysis, Visualisation and Power BI",
    meta: "Level 2 · Power BI · Badge earned",
  },
  {
    state: "progress" as const,
    title: "SQL, Digital Health Systems",
    meta: "Level 3 · SQL · In progress",
    progress: 60,
  },
  { state: "upcoming" as const, title: "Statistical Analysis with R" },
  {
    state: "upcoming" as const,
    title: "Python for Analysis and Machine Learning",
  },
  { state: "upcoming" as const, title: "Portfolio, Career and Capstone" },
];

const heroItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: MOTION_EASE },
  },
};

const heroStagger = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08 },
  },
};

const CARD_ROW_DELAY = 0.22;
const CARD_ROW_STAGGER = 0.1;

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function PlusMark({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 26 26"
      className={className}
      fill="none"
    >
      <path
        d="M13 2v22M2 13h22"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

const FLOAT_SPRING = { stiffness: 160, damping: 18, mass: 0.45 };

function PathwayFloatCard({
  children,
  reducedMotion,
  className,
}: {
  children: ReactNode;
  reducedMotion: boolean;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  const xSpring = useSpring(x, FLOAT_SPRING);
  const ySpring = useSpring(y, FLOAT_SPRING);
  const rotateXSpring = useSpring(rotateX, FLOAT_SPRING);
  const rotateYSpring = useSpring(rotateY, FLOAT_SPRING);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reducedMotion) return;
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    x.set(px * 16);
    y.set(py * 14);
    rotateY.set(px * 8);
    rotateX.set(-py * 8);
  };

  const onPointerLeave = () => {
    x.set(0);
    y.set(0);
    rotateX.set(0);
    rotateY.set(0);
  };

  return (
    <div
      ref={wrapRef}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className="h-full"
    >
      <motion.div
        style={
          reducedMotion
            ? undefined
            : {
                x: xSpring,
                y: ySpring,
                rotateX: rotateXSpring,
                rotateY: rotateYSpring,
                transformPerspective: 900,
              }
        }
        className={className}
      >
        {children}
      </motion.div>
    </div>
  );
}

function CheckMark({
  reducedMotion,
  delay,
}: {
  reducedMotion: boolean;
  delay: number;
}) {
  return (
    <motion.span
      initial={reducedMotion ? false : { scale: 0.55, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.35, delay, ease: MOTION_EASE }}
      className="flex size-[26px] shrink-0 items-center justify-center rounded-full bg-accent"
    >
      <Check className="size-3 stroke-[2.5] text-accent-foreground" />
    </motion.span>
  );
}

export function PathwayHeroSection() {
  const router = useRouter();
  const reducedMotion = usePrefersReducedMotion();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All categories");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  const fetchResults = useCallback(async (q: string, cat: string) => {
    if (!q.trim()) {
      setResults([]);
      setShowResults(false);
      return;
    }
    setIsLoading(true);
    try {
      const params = new URLSearchParams({ q: q.trim(), take: "5" });
      if (cat !== "All categories") params.set("category", cat);
      const res = await fetch(`/api/courses?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setResults(data.courses ?? []);
        setShowResults(true);
      }
    } catch {
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleInputChange = (value: string) => {
    setQuery(value);
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      fetchResults(value, category);
    }, 300);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowResults(false);
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (category !== "All categories") params.set("category", category);
    router.push(`/courses${params.toString() ? `?${params.toString()}` : ""}`);
  };

  useEffect(() => {
    const onPointerDown = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowResults(false);
      }
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, []);

  return (
    <header
      className="relative overflow-hidden text-white"
      style={{
        background:
          "linear-gradient(160deg, var(--primary-strong) 0%, var(--primary) 58%, var(--primary-strong) 100%)",
      }}
    >
      <PlusMark
        className={`pointer-events-none absolute top-[18%] left-[6%] size-6 text-accent opacity-35 ${reducedMotion ? "" : "animate-float"}`}
      />
      <PlusMark
        className={`pointer-events-none absolute top-[9%] left-[46%] size-[18px] text-accent opacity-30 ${reducedMotion ? "" : "animate-float"}`}
      />
      <PlusMark
        className={`pointer-events-none absolute right-[4%] bottom-[26%] size-10 text-accent opacity-20 ${reducedMotion ? "" : "animate-float"}`}
      />

      <div className="relative mx-auto w-full max-w-[96rem] px-5 pt-12 sm:px-8 md:pt-16 lg:px-12 xl:px-16 xl:pt-[88px]">
        <motion.div
          className="flex flex-wrap items-center gap-10 xl:gap-12"
          initial={reducedMotion ? "visible" : "hidden"}
          animate="visible"
          variants={
            reducedMotion
              ? { hidden: {}, visible: {} }
              : {
                  hidden: {},
                  visible: { transition: { staggerChildren: 0.12 } },
                }
          }
        >
          <motion.div
            variants={heroStagger}
            className="flex min-w-0 flex-1 basis-[480px] flex-col gap-6"
          >
            <motion.p
              variants={heroItem}
              className="flex items-center gap-2.5 font-mono text-[12px] tracking-[0.1em] text-white/80 uppercase"
            >
              <span className="inline-block size-2 bg-accent" />
              PharmEdge · by PharmAnalytics · Africa
            </motion.p>

            <motion.h1
              variants={heroStagger}
              className="font-display max-w-[18ch] text-[2.5rem] leading-[1.04] font-medium tracking-[-0.02em] text-balance sm:text-[2.75rem] md:text-[3.25rem] lg:text-[3.6rem] xl:text-[4.4rem]"
            >
              <motion.span variants={heroItem} className="inline">
                From dispensing to{" "}
              </motion.span>
              <motion.span variants={heroItem} className="text-accent">
                decision-making.
              </motion.span>
            </motion.h1>

            <motion.p
              variants={heroItem}
              className="max-w-[540px] text-base leading-relaxed text-white/80 md:text-lg"
            >
              Learn data, analytics and AI through problems you already know:
              stockouts, expired stock, adverse drug reactions. Taught by
              pharmacists, at your own pace, alongside your job.
            </motion.p>

            <motion.div variants={heroItem} className="flex max-w-[600px] flex-col gap-3">
              <div ref={searchRef} className="relative">
                <form
                  onSubmit={handleSubmit}
                  className="flex flex-wrap gap-1 rounded-2xl bg-white p-1.5 shadow-[0_10px_30px_rgba(0,0,40,0.35)]"
                >
                  <label htmlFor="pathway-hero-cat" className="sr-only">
                    Category
                  </label>
                  <div className="relative min-w-0 flex-[0_1_170px]">
                    <select
                      id="pathway-hero-cat"
                      value={category}
                      onChange={(e) => {
                        setCategory(e.target.value);
                        if (query.trim()) fetchResults(query, e.target.value);
                      }}
                      className="h-12 w-full appearance-none rounded-[11px] border-0 bg-muted pr-8 pl-3 text-[15px] text-foreground outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                      {categories.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="pointer-events-none absolute top-1/2 right-2.5 size-4 -translate-y-1/2 text-muted-soft" />
                  </div>
                  <label htmlFor="pathway-hero-q" className="sr-only">
                    Search courses
                  </label>
                  <input
                    id="pathway-hero-q"
                    type="text"
                    value={query}
                    onChange={(e) => handleInputChange(e.target.value)}
                    onFocus={() => {
                      if (results.length > 0) setShowResults(true);
                    }}
                    placeholder="Search courses, e.g. SQL, Power BI, dosing"
                    className="h-12 min-w-0 flex-1 basis-[200px] border-0 bg-transparent px-3.5 text-base text-foreground outline-none placeholder:text-muted-soft"
                  />
                  {query ? (
                    <button
                      type="button"
                      onClick={() => {
                        setQuery("");
                        setResults([]);
                        setShowResults(false);
                      }}
                      className="self-center rounded-full p-2 text-muted-soft hover:bg-muted"
                      aria-label="Clear search"
                    >
                      <X className="size-4" />
                    </button>
                  ) : null}
                  <Button
                    type="submit"
                    className="h-12 rounded-[11px] px-5 text-[15px] font-medium hover:bg-primary-strong"
                  >
                    Search
                  </Button>
                </form>

                <AnimatePresence>
                  {showResults ? (
                    <motion.div
                      initial={reducedMotion ? false : { opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={reducedMotion ? undefined : { opacity: 0, y: 8 }}
                      transition={{ duration: 0.2, ease: MOTION_EASE }}
                      className="absolute inset-x-0 top-full z-50 mt-2 max-h-[360px] overflow-hidden rounded-2xl border border-border bg-white text-foreground shadow-[0_8px_32px_rgba(0,0,0,0.12)]"
                    >
                      {isLoading ? (
                        <div className="flex items-center justify-center py-8 text-sm text-muted-soft">
                          <span className="mr-2 size-4 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                          Searching...
                        </div>
                      ) : results.length === 0 ? (
                        <div className="py-8 text-center text-sm text-muted-soft">
                          No courses found for &ldquo;{query}&rdquo;
                        </div>
                      ) : (
                        <div className="max-h-[360px] overflow-y-auto py-2">
                          {results.map((course) => (
                            <Link
                              key={course.id}
                              href={`/courses/${course.id}`}
                              onClick={() => setShowResults(false)}
                              className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-muted"
                            >
                              {course.thumbnailUrl ? (
                                <img
                                  src={course.thumbnailUrl}
                                  alt=""
                                  className="size-10 shrink-0 rounded-lg object-cover"
                                />
                              ) : (
                                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-accent-soft">
                                  <Search className="size-4 text-primary" />
                                </div>
                              )}
                              <div className="min-w-0 flex-1">
                                <p className="truncate text-sm font-semibold">
                                  {course.title}
                                </p>
                                <p className="text-xs text-muted-soft">
                                  {course.mentorName}
                                </p>
                              </div>
                              <div className="shrink-0 text-xs font-semibold text-primary">
                                {course.priceMinorUnits != null &&
                                course.priceMinorUnits > 0
                                  ? `$${(course.priceMinorUnits / 100).toFixed(2)}`
                                  : "Free"}
                              </div>
                            </Link>
                          ))}
                          <Link
                            href={`/courses${query ? `?q=${encodeURIComponent(query.trim())}` : ""}`}
                            onClick={() => setShowResults(false)}
                            className="flex items-center justify-center gap-1 border-t border-border px-4 py-3 text-sm font-semibold text-primary hover:bg-muted"
                          >
                            View all results
                            <span aria-hidden>→</span>
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            </motion.div>

            <motion.div variants={heroItem}>
              <AnimatedStagger stagger={0.06} className="flex flex-wrap items-center gap-2">
                <AnimatedStaggerItem>
                  <span className="text-[13px] text-white/70">Popular:</span>
                </AnimatedStaggerItem>
                {popularSearches.map((term) => (
                  <AnimatedStaggerItem key={term}>
                    <Link
                      href={`/courses?q=${encodeURIComponent(term)}`}
                      className="inline-block rounded-full border border-white/30 px-3.5 py-1.5 text-[13px] text-white transition-transform transition-colors hover:-translate-y-0.5 hover:border-accent hover:text-accent"
                    >
                      {term}
                    </Link>
                  </AnimatedStaggerItem>
                ))}
              </AnimatedStagger>
            </motion.div>

            <motion.div variants={heroItem} className="flex flex-wrap gap-3">
              <Button
                asChild
                className="h-12 rounded-full bg-accent px-6 text-base font-bold text-accent-foreground transition-transform hover:-translate-y-0.5 hover:bg-accent/90"
              >
                <Link href="/student/signup">Start learning free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-6 text-base font-medium text-white shadow-none transition-transform hover:-translate-y-0.5 hover:border-white hover:bg-white/5 hover:text-white"
              >
                <Link href="#pathway">See the pathway</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: MOTION_EASE }}
            className="mx-auto min-w-0 w-full max-w-[520px] flex-1 basis-[380px] [perspective:1000px]"
          >
          <PathwayFloatCard
            reducedMotion={reducedMotion}
            className="flex h-full flex-col gap-[18px] rounded-[20px] border border-white/20 bg-white/8 p-6 will-change-transform [transform-style:preserve-3d] backdrop-blur-[2px]"
          >
              <motion.div
                initial={reducedMotion ? false : { opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.45,
                  delay: CARD_ROW_DELAY,
                  ease: MOTION_EASE,
                }}
                className="flex flex-col gap-1"
              >
                <span className="font-mono text-[11px] tracking-[0.1em] text-white/70 uppercase">
                  Learner view · example
                </span>
                <p className="font-display text-xl font-bold">
                  Certified Digital Health Pharmacist
                </p>
              </motion.div>

              {pathwaySteps.map((step, index) => {
                const rowDelay = CARD_ROW_DELAY + (index + 1) * CARD_ROW_STAGGER;
                return (
                <motion.div
                  key={step.title}
                  initial={reducedMotion ? false : { opacity: 0, y: 14 }}
                  animate={{
                    opacity: step.state === "upcoming" ? 0.7 : 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.45,
                    delay: rowDelay,
                    ease: MOTION_EASE,
                  }}
                  className="flex items-center gap-3"
                >
                  {step.state === "done" ? (
                    <CheckMark reducedMotion={reducedMotion} delay={rowDelay + 0.06} />
                  ) : step.state === "progress" ? (
                    <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full border-2 border-accent text-[12px] font-bold text-accent">
                      {index + 1}
                    </span>
                  ) : (
                    <span className="flex size-[26px] shrink-0 items-center justify-center rounded-full border border-dashed border-white/60 text-[12px]">
                      {index + 1}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-col gap-1.5">
                      <div>
                        <div className="text-sm font-medium">{step.title}</div>
                        {"meta" in step && step.meta ? (
                          <div className="font-mono text-[11px] tracking-[0.06em] text-white/65 uppercase">
                            {step.meta}
                          </div>
                        ) : null}
                      </div>
                      {step.state === "progress" ? (
                        <div className="h-1.5 overflow-hidden rounded-full bg-white/18">
                          <motion.div
                            className="h-full rounded-full bg-accent"
                            initial={reducedMotion ? false : { width: 0 }}
                            animate={{ width: `${step.progress}%` }}
                            transition={{
                              duration: 0.9,
                              delay: rowDelay + 0.18,
                              ease: MOTION_EASE,
                            }}
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>
                </motion.div>
                );
              })}
          </PathwayFloatCard>
          </motion.div>
        </motion.div>

        <motion.div
          className="mt-10 flex flex-wrap border-t border-white/18 md:mt-14 xl:mt-[72px]"
          initial={reducedMotion ? false : { opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={MOTION_VIEWPORT}
          transition={{ duration: 0.55, ease: MOTION_EASE }}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex min-w-0 flex-1 basis-[200px] flex-col gap-1.5 py-7"
            >
              <AnimatedCounter
                value={stat.value}
                className="font-display text-3xl leading-none font-medium xl:text-4xl"
              />
              <span className="font-mono text-[11px] tracking-[0.1em] text-white/70 uppercase">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>
      </div>
    </header>
  );
}
