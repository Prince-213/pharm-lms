"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { JOB_SOURCE_LABELS, type JobSourceId } from "@/lib/jobs/constants";
import { runJobAlertsNowAction, updateJobAlertSettingsAction } from "./actions";

type SourceRow = {
  source: JobSourceId;
  enabled: boolean;
};

export function JobAlertsSettingsForm({
  enabled,
  cadenceDays,
  maxEmailJobs,
  defaultKeywords,
  sources,
  cadenceBlocked,
}: {
  enabled: boolean;
  cadenceDays: number;
  maxEmailJobs: number;
  defaultKeywords: string[];
  sources: SourceRow[];
  cadenceBlocked: boolean;
}) {
  const [pending, start] = useTransition();
  const [running, startRun] = useTransition();

  return (
    <div className="space-y-6">
      <form
        action={(formData) => {
          start(async () => {
            await updateJobAlertSettingsAction(formData);
          });
        }}
        className="space-y-5"
      >
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" name="enabled" defaultChecked={enabled} />
          Alerts enabled
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="text-sm">
            <label htmlFor="cadenceDays">Cadence (days)</label>
            <Input
              id="cadenceDays"
              name="cadenceDays"
              type="number"
              min={1}
              max={30}
              defaultValue={cadenceDays}
              className="mt-1"
            />
          </div>
          <div className="text-sm">
            <label htmlFor="maxEmailJobs">Max jobs per email</label>
            <Input
              id="maxEmailJobs"
              name="maxEmailJobs"
              type="number"
              min={1}
              max={8}
              defaultValue={maxEmailJobs}
              className="mt-1"
            />
          </div>
        </div>
        <div className="text-sm">
          <label htmlFor="defaultKeywords">Default keywords</label>
          <Input
            id="defaultKeywords"
            name="defaultKeywords"
            defaultValue={defaultKeywords.join(", ")}
            className="mt-1"
          />
        </div>
        <fieldset className="space-y-2">
          <legend className="text-sm font-medium">Sources</legend>
          {sources.map((source) => (
            <label
              key={source.source}
              className="flex items-center gap-3 text-sm"
            >
              <input
                type="checkbox"
                name={`source_${source.source}`}
                defaultChecked={source.enabled}
              />
              {JOB_SOURCE_LABELS[source.source]}
            </label>
          ))}
        </fieldset>
        <Button type="submit" disabled={pending}>
          Save settings
        </Button>
      </form>

      <form
        action={() => {
          startRun(async () => {
            await runJobAlertsNowAction();
          });
        }}
      >
        <Button
          type="submit"
          variant="outline"
          disabled={running || cadenceBlocked}
        >
          {cadenceBlocked
            ? "Cadence window active"
            : running
              ? "Running…"
              : "Run now"}
        </Button>
        {cadenceBlocked ? (
          <p className="mt-2 text-xs text-muted-foreground">
            The cadence guard blocks a second scrape until the window ends.
          </p>
        ) : null}
      </form>
    </div>
  );
}
