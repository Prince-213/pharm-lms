"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { FeatureComingSoon } from "@/components/ui/feature-coming-soon";
import { type BoardJob, JobsBoard } from "./jobs-board";
import { JobsOnboarding } from "./jobs-onboarding";

type Prefs = {
  roles: string[];
  workStyle: string | null;
  level: string | null;
  jobAlertsEnabled: boolean;
  onboardingStatus: "PENDING" | "SKIPPED" | "COMPLETE";
};

export function JobsPageClient({
  prefs,
  live,
  jobs,
  startOnboarding,
  cadenceDays,
  lastSuccessAt,
  nextScrapeAt,
}: {
  prefs: Prefs;
  live: boolean;
  jobs: BoardJob[];
  startOnboarding: boolean;
  cadenceDays: number;
  lastSuccessAt: string | null;
  nextScrapeAt: string | null;
}) {
  const [showOnboarding, setShowOnboarding] = useState(startOnboarding);

  if (showOnboarding) {
    return (
      <JobsOnboarding
        initialRoles={prefs.roles}
        initialWorkStyle={prefs.workStyle}
        initialLevel={prefs.level}
        initialAlerts={prefs.jobAlertsEnabled}
        onClose={() => setShowOnboarding(false)}
      />
    );
  }

  if (!live) {
    return (
      <div>
        {prefs.onboardingStatus !== "PENDING" ? (
          <div className="mb-6 flex justify-end">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowOnboarding(true)}
            >
              Refine matches
            </Button>
          </div>
        ) : null}
        <FeatureComingSoon
          title="Jobs board"
          description="Weekly matches from public healthcare and data boards are almost ready. Your preferences are saved."
          backHref="/student/dashboard"
          backLabel="Back to dashboard"
        />
      </div>
    );
  }

  return (
    <JobsBoard
      jobs={jobs}
      cadenceDays={cadenceDays}
      lastSuccessAt={lastSuccessAt}
      nextScrapeAt={nextScrapeAt}
      onRefine={() => setShowOnboarding(true)}
    />
  );
}
