import { MeetingStatus } from "@/generated/prisma/enums";
import { db } from "@/lib/db";
import { meetingSessionMaxMs } from "@/lib/meetings/session-window";

/**
 * Closes out old SCHEDULED meetings: if nobody opened the join link before the session
 * window ended → EXPIRED; if they did → COMPLETED. Safe to run on every meetings page load.
 */
export async function reconcileStaleMeetings(): Promise<void> {
  const sessionMs = meetingSessionMaxMs();
  const now = new Date();
  const cutoff = new Date(now.getTime() - sessionMs);

  await db.meeting.updateMany({
    where: {
      status: MeetingStatus.SCHEDULED,
      startsAt: { lt: cutoff },
      openedAt: null,
    },
    data: {
      status: MeetingStatus.EXPIRED,
      endsAt: now,
    },
  });

  await db.meeting.updateMany({
    where: {
      status: MeetingStatus.SCHEDULED,
      startsAt: { lt: cutoff },
      openedAt: { not: null },
    },
    data: {
      status: MeetingStatus.COMPLETED,
      endsAt: now,
    },
  });
}

type ReconcileGate = {
  lastRunMs: number;
  inFlight: Promise<void> | null;
};

const gateKey = "__pharmLms_reconcileMeetingsGate__";

function getGate(): ReconcileGate {
  const g = globalThis as unknown as Record<string, unknown>;
  const existing = g[gateKey] as ReconcileGate | undefined;
  if (existing) return existing;
  const created: ReconcileGate = { lastRunMs: 0, inFlight: null };
  g[gateKey] = created;
  return created;
}

/**
 * Throttled wrapper to keep page loads fast in dev/prod.
 * - Collapses concurrent calls into a single DB write batch\n+ * - Runs at most once per `minIntervalMs` per server process\n+ */
export async function reconcileStaleMeetingsThrottled(
  minIntervalMs = 5 * 60 * 1000,
): Promise<void> {
  const gate = getGate();
  const now = Date.now();
  if (gate.inFlight) return gate.inFlight;
  if (now - gate.lastRunMs < minIntervalMs) return;
  gate.inFlight = reconcileStaleMeetings()
    .catch(() => {
      // Never let this background maintenance break page renders.
    })
    .finally(() => {
      gate.lastRunMs = Date.now();
      gate.inFlight = null;
    });
  return gate.inFlight;
}
