"use client";

import { useEffect } from "react";

function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = window.atob(base64);
  const output = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) output[i] = raw.charCodeAt(i);
  return output;
}

export function WebPushRegistrar() {
  useEffect(() => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY?.trim();
    if (!publicKey || !("serviceWorker" in navigator) || !("PushManager" in window)) {
      return;
    }
    const vapidKey = publicKey;

    let cancelled = false;

    async function register() {
      try {
        const permission = await Notification.requestPermission();
        if (permission !== "granted" || cancelled) return;

        const registration = await navigator.serviceWorker.register("/sw.js");
        const existing = await registration.pushManager.getSubscription();
        const subscription =
          existing ??
          (await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey: urlBase64ToUint8Array(vapidKey),
          }));

        const json = subscription.toJSON();
        if (!json.endpoint || !json.keys?.p256dh || !json.keys?.auth) return;

        await fetch("/api/notifications/push/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            endpoint: json.endpoint,
            keys: { p256dh: json.keys.p256dh, auth: json.keys.auth },
          }),
        });
      } catch {
        // Push is optional; ignore registration failures.
      }
    }

    void register();
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
