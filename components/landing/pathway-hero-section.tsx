"use client";

import { ChevronDown, Search, X } from "lucide-react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
} from "motion/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ReactNode,
  type PointerEvent as ReactPointerEvent,
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  AnimatedCounter,
  AnimatedStagger,
  AnimatedStaggerItem,
  MOTION_EASE,
  MOTION_VIEWPORT,
  usePrefersReducedMotion,
} from "@/components/landing/motion-primitives";
import { Button } from "@/components/ui/button";
import {
  AnimatedSpan,
  Terminal,
  TypingAnimation,
} from "@/components/ui/terminal";
import { cn } from "@/lib/utils";

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

const stockoutsTable = [
  "drug_name".padEnd(26) + "units".padStart(6),
  "Amoxicillin 500mg".padEnd(26) + "1,240".padStart(6),
  "Paracetamol 500mg".padEnd(26) + "1,105".padStart(6),
  "Artemether-lumefantrine".padEnd(26) + "892".padStart(6),
].join("\n");

const codeScenes = [
  {
    label: "Stockouts",
    file: "top_sellers.sql",
    question: "Which drugs sold the most last month?",
    code: "SELECT drug_name, SUM(quantity) AS units\nFROM dispensing\nWHERE month = '2026-09'\nGROUP BY drug_name\nORDER BY units DESC\nLIMIT 3;",
    out: stockoutsTable,
  },
  {
    label: "Safety signals",
    file: "signal_detection.R",
    question: "Is this drug reported with a reaction more often than expected?",
    code: "a <- 18    # drug X, reaction Y\nb <- 142   # drug X, other reactions\nc <- 90    # other drugs, reaction Y\nd <- 3750  # other drugs, other reactions\n\nprr <- (a / (a + b)) / (c / (c + d))\nror <- (a / b) / (c / d)",
    out: "PRR  4.80\nROR  5.28\nReported more often than expected. Review the cases.",
  },
  {
    label: "Adherence",
    file: "adherence_model.py",
    question: "Which patient is likely to stop taking their medicine?",
    code: 'from sklearn.linear_model import LogisticRegression\n\nmodel = LogisticRegression()\nmodel.fit(X_train, y_train)\n\nrisk = model.predict_proba(patient)[0][1]\nprint(f"Non-adherence risk: {risk:.2f}")',
    out: "Non-adherence risk: 0.72\nNext step: schedule a refill reminder.",
  },
] as const;

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

let debounceTimer: ReturnType<typeof setTimeout> | null = null;

function PlusMark({ className }: { className?: string }) {
  return (
    <svg aria-hidden viewBox="0 0 26 26" className={className} fill="none">
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

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
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

function HeroCodePanel({ reducedMotion }: { reducedMotion: boolean }) {
  const [active, setActive] = useState(0);
  const [playId, setPlayId] = useState(0);
  const scene = codeScenes[active] ?? codeScenes[0];

  const selectScene = (index: number) => {
    setActive(index);
    setPlayId((id) => id + 1);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap gap-2">
        {codeScenes.map((item, index) => {
          const selected = index === active;
          return (
            <button
              key={item.label}
              type="button"
              aria-pressed={selected}
              onClick={() => selectScene(index)}
              className={cn(
                "min-h-11 rounded-full border px-[18px] text-sm transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98]",
                selected
                  ? "border-accent bg-accent font-bold text-accent-foreground"
                  : "border-white/25 bg-transparent font-medium text-white hover:border-white/50",
              )}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      <PathwayFloatCard
        reducedMotion={reducedMotion}
        className="will-change-transform [transform-style:preserve-3d]"
      >
        {reducedMotion ? (
          <div className="overflow-hidden rounded-2xl border border-white/14 bg-[#0B0B1C] shadow-[0_24px_60px_rgba(0,0,60,0.5)]">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-[18px] py-3">
              <div className="flex gap-1.5" aria-hidden>
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
                <span className="size-2.5 rounded-full bg-white/20" />
              </div>
              <span className="font-mono text-[12px] text-[#8F8FA8]">
                {scene.file}
              </span>
            </div>
            <div className="flex flex-col gap-2.5 p-[18px]">
              <p className="text-sm font-medium text-accent">
                {scene.question}
              </p>
              <pre className="overflow-x-auto font-mono text-[13px] leading-[1.7] whitespace-pre text-white">
                {scene.code}
              </pre>
              <div className="mt-1 flex flex-col gap-2 rounded-[10px] border border-accent/25 bg-primary/35 px-4 py-3.5">
                <span className="font-mono text-[11px] tracking-[0.1em] text-accent uppercase">
                  Output · mock data
                </span>
                <pre className="overflow-x-auto font-mono text-[13px] leading-[1.7] whitespace-pre text-white">
                  {scene.out}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <Terminal
            key={playId}
            filename={scene.file}
            startOnView={false}
            className="max-w-none"
          >
            <TypingAnimation
              className="font-sans text-sm font-medium text-accent"
              duration={26}
            >
              {scene.question}
            </TypingAnimation>
            <TypingAnimation
              className="font-mono text-[13px] leading-[1.7] whitespace-pre text-white"
              duration={12}
            >
              {scene.code}
            </TypingAnimation>
            <AnimatedSpan className="mt-1 rounded-t-[10px] border border-b-0 border-accent/25 bg-primary/35 px-4 pt-3.5">
              <span className="block font-mono text-[11px] tracking-[0.1em] text-accent uppercase">
                Output · mock data
              </span>
            </AnimatedSpan>
            <TypingAnimation
              as="div"
              hideUntilStart
              duration={8}
              className="-mt-2.5 rounded-b-[10px] border border-t-0 border-accent/25 bg-primary/35 px-4 pb-3.5 font-mono text-[13px] leading-[1.7] whitespace-pre text-white"
            >
              {scene.out}
            </TypingAnimation>
          </Terminal>
        )}
      </PathwayFloatCard>
    </div>
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

      <div className="relative mx-auto w-full max-w-[90rem] px-6 pt-16 sm:px-10 md:pt-20 lg:px-16 xl:px-20 xl:pt-[88px]">
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

            <motion.div
              variants={heroItem}
              className="flex max-w-[600px] flex-col gap-3"
            >
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
              <AnimatedStagger
                stagger={0.06}
                className="flex flex-wrap items-center gap-2"
              >
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
                className="h-12 rounded-full bg-accent px-6 text-base font-bold text-accent-foreground transition-transform duration-200 hover:-translate-y-0.5 hover:bg-accent/90 active:scale-[0.98]"
              >
                <Link href="/student/signup">Start learning free</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 rounded-full border-white/40 bg-transparent px-6 text-base font-medium text-white shadow-none transition-transform duration-200 hover:-translate-y-0.5 hover:border-white hover:bg-white/5 hover:text-white active:scale-[0.98]"
              >
                <Link href="#pathway">See the pathway</Link>
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={reducedMotion ? false : { opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: MOTION_EASE }}
            className="mx-auto min-w-0 w-full max-w-[560px] flex-1 basis-[440px]"
          >
            <HeroCodePanel reducedMotion={reducedMotion} />
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
