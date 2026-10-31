"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ROLE_OPTIONS } from "@/lib/jobs/constants";
import { saveJobOnboardingAction, skipJobOnboardingAction } from "./actions";

const WORK_STYLES = [
  { id: "REMOTE", label: "Remote" },
  { id: "COUNTRY", label: "In my country" },
  { id: "RELOCATE", label: "Open to relocate" },
] as const;

const LEVELS = [
  { id: "STUDENT", label: "Student" },
  { id: "EARLY", label: "Early career" },
  { id: "EXPERIENCED", label: "Experienced" },
] as const;

type Props = {
  initialRoles: string[];
  initialWorkStyle: string | null;
  initialLevel: string | null;
  initialAlerts: boolean;
  onClose?: () => void;
};

export function JobsOnboarding({
  initialRoles,
  initialWorkStyle,
  initialLevel,
  initialAlerts,
  onClose,
}: Props) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [roles, setRoles] = useState<string[]>(initialRoles);
  const [workStyle, setWorkStyle] = useState(initialWorkStyle ?? "");
  const [level, setLevel] = useState(initialLevel ?? "");
  const [alerts, setAlerts] = useState(initialAlerts);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  function toggleRole(id: string) {
    setRoles((current) =>
      current.includes(id) ? current.filter((r) => r !== id) : [...current, id],
    );
  }

  function finish() {
    setError(null);
    start(async () => {
      const result = await saveJobOnboardingAction({
        roles,
        workStyle,
        level,
        jobAlertsEnabled: alerts,
      });
      if (!result.ok) {
        setError(result.message);
        return;
      }
      if (result.emailed) {
        toast.success(
          "Preferences saved. Matching roles will be emailed from this week's cache.",
        );
      }
      onClose?.();
      router.refresh();
    });
  }

  function skip() {
    setError(null);
    start(async () => {
      const result = await skipJobOnboardingAction();
      if (!result.ok) {
        setError(result.message);
        return;
      }
      onClose?.();
      router.refresh();
    });
  }

  return (
    <div className="mx-auto w-full max-w-xl rounded-md border border-border bg-card p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Step {step} of 4
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold tracking-tight">
        {step === 1 && "Which pathway roles fit you?"}
        {step === 2 && "How do you want to work?"}
        {step === 3 && "Where are you in your career?"}
        {step === 4 && "Email when matches are ready"}
      </h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Skip anytime. We will still rank on your country and enrolled courses.
      </p>

      <div className="mt-6 space-y-3">
        {step === 1
          ? ROLE_OPTIONS.map((role) => {
              const on = roles.includes(role.id);
              return (
                <button
                  key={role.id}
                  type="button"
                  onClick={() => toggleRole(role.id)}
                  className={`flex w-full rounded-md border px-4 py-3 text-left text-sm font-medium transition-colors ${
                    on
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-background"
                  }`}
                >
                  {role.label}
                </button>
              );
            })
          : null}

        {step === 2
          ? WORK_STYLES.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setWorkStyle(item.id)}
                className={`flex w-full rounded-md border px-4 py-3 text-left text-sm font-medium ${
                  workStyle === item.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background"
                }`}
              >
                {item.label}
              </button>
            ))
          : null}

        {step === 3
          ? LEVELS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setLevel(item.id)}
                className={`flex w-full rounded-md border px-4 py-3 text-left text-sm font-medium ${
                  level === item.id
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-background"
                }`}
              >
                {item.label}
              </button>
            ))
          : null}

        {step === 4 ? (
          <label className="flex items-start gap-3 rounded-md border border-border px-4 py-3 text-sm">
            <input
              type="checkbox"
              className="mt-1"
              checked={alerts}
              onChange={(e) => setAlerts(e.target.checked)}
            />
            <span>
              Email me my first matches now from this week&apos;s cache, then
              again after each weekly scrape. You can turn this off later.
            </span>
          </label>
        ) : null}
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="ghost" onClick={skip} disabled={pending}>
          Skip for now
        </Button>
        <div className="flex gap-2">
          {step > 1 ? (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((s) => s - 1)}
              disabled={pending}
            >
              Back
            </Button>
          ) : null}
          {step < 4 ? (
            <Button
              type="button"
              className="bg-accent text-accent-foreground"
              onClick={() => setStep((s) => s + 1)}
            >
              Continue
            </Button>
          ) : (
            <Button
              type="button"
              className="bg-accent text-accent-foreground"
              onClick={finish}
              disabled={pending}
            >
              Save matches
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
