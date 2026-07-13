import webpush from "web-push";
import { db } from "@/lib/db";

type PushPayload = {
  title: string;
  body?: string | null;
  href?: string | null;
};

let vapidConfigured = false;

function ensureVapid() {
  if (vapidConfigured) return true;
  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:support@pharmlms.local";
  if (!publicKey?.trim() || !privateKey?.trim()) return false;
  webpush.setVapidDetails(subject, publicKey, privateKey);
  vapidConfigured = true;
  return true;
}

export async function sendWebPushToUser(
  userId: string,
  payload: PushPayload,
): Promise<void> {
  if (!ensureVapid()) return;

  const subs = await db.notificationSubscription.findMany({
    where: { userId },
    take: 20,
  });
  if (!subs.length) return;

  const body = JSON.stringify({
    title: payload.title,
    body: payload.body ?? "",
    href: payload.href ?? "/",
  });

  await Promise.all(
    subs.map(async (sub) => {
      try {
        await webpush.sendNotification(
          {
            endpoint: sub.endpoint,
            keys: { p256dh: sub.p256dh, auth: sub.auth },
          },
          body,
        );
      } catch (err) {
        const status =
          typeof err === "object" && err !== null && "statusCode" in err
            ? (err as { statusCode?: number }).statusCode
            : undefined;
        if (status === 404 || status === 410) {
          await db.notificationSubscription.delete({ where: { id: sub.id } });
        }
      }
    }),
  );
}

export type CreateNotificationInput = {
  userId: string;
  kind: string;
  title: string;
  body?: string | null;
  href?: string | null;
  assignmentId?: string | null;
};

export async function createNotification(input: CreateNotificationInput) {
  const notification = await db.notification.create({ data: input });
  void sendWebPushToUser(input.userId, {
    title: input.title,
    body: input.body,
    href: input.href,
  });
  return notification;
}

export async function createNotifications(
  inputs: CreateNotificationInput[],
) {
  if (!inputs.length) return;
  await db.notification.createMany({ data: inputs });
  for (const input of inputs) {
    void sendWebPushToUser(input.userId, {
      title: input.title,
      body: input.body,
      href: input.href,
    });
  }
}
