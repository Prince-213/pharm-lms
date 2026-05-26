import type { PrismaClient } from "@/generated/prisma/client";
import { getPrismaClient } from "@/lib/prisma";

/**
 * Lazy proxy so dev hot-reload picks up delegates after `prisma generate`
 * (avoids a cached client missing new models like `blogPost`).
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, prop, receiver) {
    const client = getPrismaClient();
    const value = Reflect.get(client as object, prop, receiver);
    return typeof value === "function"
      ? (value as (...args: unknown[]) => unknown).bind(client)
      : value;
  },
});
