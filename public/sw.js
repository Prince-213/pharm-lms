self.addEventListener("push", (event) => {
  let data = { title: "Pharm LMS", body: "", href: "/" };
  try {
    data = { ...data, ...JSON.parse(event.data?.text() ?? "{}") };
  } catch {
    // ignore malformed payloads
  }

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: "/favicon.ico",
      data: { href: data.href },
    }),
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const href = event.notification.data?.href ?? "/";
  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then((list) => {
      for (const client of list) {
        if ("focus" in client) {
          client.navigate(href);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(href);
    }),
  );
});
