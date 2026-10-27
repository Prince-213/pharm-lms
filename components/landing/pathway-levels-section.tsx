"use client";

import { useState } from "react";
import { Medal } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  AnimatedSection,
  AnimatedStagger,
  AnimatedStaggerItem,
  MOTION_EASE,
  usePrefersReducedMotion,
} from "@/components/landing/motion-primitives";
import {
  LandingContainer,
  LandingEyebrow,
  LandingHeading,
} from "@/components/landing/landing-container";
import { cn } from "@/lib/utils";

const levels = [
  {
    short: "Excel",
    title: "Foundations of Data in Pharmacy",
    weeks: "2 weeks",
    hours: "~15 hours",
    summary:
      "Learn what data is, why it matters in a pharmacy, and how to clean and analyse a real dataset. You start with stockouts, expired drugs and revenue leakage.",
    tools: ["Excel", "SUMIF, COUNTIF, VLOOKUP", "Pharmacy Data Starter Kit"],
    projectLabel: "Mini-project",
    projectTitle: "Drug Sales Summary report",
    project:
      "Calculate revenue by drug, find the top and bottom five sellers, flag drugs with zero sales this month, and produce a one-page summary for a pharmacy manager.",
    badge: "Badge: Data Literacy for Pharmacists",
  },
  {
    short: "Power BI",
    title: "Data Analysis, Visualisation and Power BI",
    weeks: "4 weeks",
    hours: "~25 hours",
    summary:
      "Move from tables to insight. Build pivot tables, clean data at scale with Power Query, and present findings to a non-technical manager.",
    tools: ["Excel pivot tables", "Power Query", "Power BI", "DAX basics"],
    projectLabel: "Mini-project",
    projectTitle: "Pharmacy Sales Dashboard",
    project:
      "Build a multi-page Power BI dashboard with top drugs by revenue, monthly trends, branch comparison and inventory risk flags, plus a one-page summary of three insights.",
    badge: "Badge: Data Analysis and Visualisation, Pharmacy Track",
  },
  {
    short: "SQL",
    title: "SQL, Digital Health Systems and Advanced Power BI",
    weeks: "3 weeks",
    hours: "~20 hours",
    summary:
      "Query pharmacy databases, understand how EHRs, e-prescriptions and health data standards connect, and cover AI ethics and NDPR data governance.",
    tools: ["SQL", "Power BI (advanced)", "FHIR and HL7 overview", "NDPR basics"],
    projectLabel: "Mini-project",
    projectTitle: "Pharmacy Database Dashboard",
    project:
      "Write eight SQL queries that answer management questions, then connect the database to Power BI and build a three-page dashboard with drill-through.",
    badge: "Badge: Digital Health and SQL Analytics",
  },
  {
    short: "R",
    title: "Statistical Analysis with R",
    weeks: "2 weeks",
    hours: "~15 hours",
    summary:
      "Use R for statistics and pharmacovigilance only, after you already think in data. Cover hypothesis testing, regression and signal detection with PRR and ROR.",
    tools: ["R and RStudio", "ggplot2, dplyr", "PRR and ROR"],
    projectLabel: "Mini-project",
    projectTitle: "Pharmacovigilance Statistical Report",
    project:
      "Analyse a mock adverse drug reaction dataset, calculate PRR and ROR for three drug-event pairs, and write a two-page plain-English signal detection brief.",
    badge: "Badge: Statistical Analysis for Pharmacists",
  },
  {
    short: "Python and ML",
    title: "Python for Data Analysis and Machine Learning",
    weeks: "5 weeks",
    hours: "~30 hours",
    summary:
      "Learn Python for analysis, then machine learning for clinical prediction. Build a Streamlit tool and learn when a simple rule beats a model.",
    tools: ["Python", "pandas, scikit-learn", "Streamlit", "Jupyter"],
    projectLabel: "Mini-project",
    projectTitle: "Medication Adherence Prediction Model",
    project:
      "Build an end-to-end model on a 2,000-row mock patient dataset, compare logistic regression with a random forest, and add a Streamlit interface and a two-page clinical brief.",
    badge: "Badge: AI Fundamentals for Pharmacists",
  },
  {
    short: "Capstone",
    title: "Portfolio, Career and Capstone Project",
    weeks: "3 weeks",
    hours: "~20 hours",
    summary:
      "Package everything into a career-ready portfolio. Build your GitHub and LinkedIn presence, practise interviews, and complete one end-to-end capstone.",
    tools: ["GitHub", "Python", "Power BI", "LinkedIn"],
    projectLabel: "Capstone project",
    projectTitle: "Design an AI-Driven Pharmacy Solution",
    project:
      "Choose an adverse drug reaction prediction system, an antibiotic resistance tracker or a medication error detection prototype. Submit a research brief, working app, dashboard, statistical annex, presentation and GitHub repo.",
    badge: "Credential: Certified Digital Health Pharmacist",
  },
] as const;

const specialisations = [
  "Pharmacovigilance Analytics",
  "AI in Personalised Medicine",
  "Digital Health Entrepreneurship",
  "Health Policy and Ethics",
  "Health Informatics and Data Engineering",
];

export function PathwayLevelsSection() {
  const [active, setActive] = useState(0);
  const level = levels[active];
  const reducedMotion = usePrefersReducedMotion();

  return (
    <section id="pathway" className="bg-background py-20 md:py-24 lg:py-28">
      <LandingContainer className="flex flex-col gap-12 lg:gap-16">
        <AnimatedSection className="max-w-3xl space-y-4">
          <LandingEyebrow>The pathway · 4 to 6 months, self-paced</LandingEyebrow>
          <LandingHeading>
            From your first spreadsheet to a capstone project.
          </LandingHeading>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground md:text-lg">
            You learn one tool at a time. Every module opens with a pharmacy
            scenario, then teaches the tool that solves it. No coding experience
            needed.
          </p>
        </AnimatedSection>

        <AnimatedStagger className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:grid sm:grid-cols-3 sm:overflow-visible sm:px-0 lg:grid-cols-6">
          {levels.map((item, index) => {
            const selected = index === active;
            return (
              <AnimatedStaggerItem key={item.short}>
              <motion.button
                type="button"
                aria-pressed={selected}
                onClick={() => setActive(index)}
                animate={reducedMotion ? undefined : { scale: selected ? 1.02 : 1 }}
                transition={{ duration: 0.2, ease: MOTION_EASE }}
                className={cn(
                  "flex min-h-16 min-w-[9.5rem] w-full flex-col items-start justify-center gap-0.5 rounded-xl border px-3.5 py-2.5 text-left transition-[color,background-color,border-color,transform] sm:min-w-0",
                  selected
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-foreground hover:-translate-y-0.5 hover:border-primary/40",
                )}
              >
                <span
                  className={cn(
                    "font-mono text-[10px] tracking-[0.12em] uppercase",
                    selected ? "text-accent" : "text-muted-soft",
                  )}
                >
                  Level {index + 1}
                </span>
                <span className="text-sm font-medium">{item.short}</span>
              </motion.button>
              </AnimatedStaggerItem>
            );
          })}
        </AnimatedStagger>

        <AnimatePresence mode="wait">
        <motion.div
          key={active}
          initial={reducedMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reducedMotion ? undefined : { opacity: 0, y: -8 }}
          transition={{ duration: 0.35, ease: MOTION_EASE }}
          className="grid gap-4 lg:grid-cols-12 lg:gap-5"
        >
          <div className="flex flex-col gap-5 rounded-2xl bg-muted p-6 sm:p-8 lg:col-span-7">
            <div className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-[11px] tracking-[0.1em] text-muted-foreground uppercase">
              <span>Level {active + 1} of 6</span>
              <span>{level.weeks}</span>
              <span>{level.hours}</span>
            </div>
            <h3 className="font-display text-balance text-2xl leading-tight font-bold tracking-[-0.02em] xl:text-[2rem]">
              {level.title}
            </h3>
            <p className="text-[16px] leading-relaxed text-muted-foreground md:text-[17px]">
              {level.summary}
            </p>
            <div className="flex flex-wrap gap-2">
              {level.tools.map((tool) => (
                <Badge
                  key={tool}
                  variant="outline"
                  className="h-auto rounded-full border-border bg-card px-3 py-1.5 text-[13px] font-medium text-primary"
                >
                  {tool}
                </Badge>
              ))}
            </div>
          </div>

          <div
            className="flex flex-col gap-4 rounded-2xl p-6 text-white sm:p-8 lg:col-span-5"
            style={{
              background:
                "linear-gradient(160deg, var(--primary-strong) 0%, var(--primary) 100%)",
            }}
          >
            <LandingEyebrow className="text-accent">{level.projectLabel}</LandingEyebrow>
            <h3 className="font-display text-xl font-bold leading-snug xl:text-[1.4rem]">
              {level.projectTitle}
            </h3>
            <p className="flex-1 text-[15px] leading-relaxed text-white/80">
              {level.project}
            </p>
            <div className="mt-2 flex items-center gap-3 border-t border-white/18 pt-4">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                <Medal className="size-5" weight="duotone" aria-hidden />
              </span>
              <span className="text-sm font-medium">{level.badge}</span>
            </div>
          </div>
        </motion.div>
        </AnimatePresence>

        <AnimatedSection delay={0.06} className="flex flex-wrap items-center gap-2.5">
          <span className="text-sm text-muted-foreground">
            After the core pathway, specialise in:
          </span>
          {specialisations.map((item) => (
            <Badge
              key={item}
              variant="outline"
              className="h-auto rounded-full px-3 py-1.5 text-[13px] font-normal"
            >
              {item}
            </Badge>
          ))}
        </AnimatedSection>
      </LandingContainer>
    </section>
  );
}
