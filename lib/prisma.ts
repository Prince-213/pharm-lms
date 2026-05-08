import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";
import { PrismaClient } from "../generated/prisma/client";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

/**
 * Explicit pool so idle clients are recycled before Neon / the pooler closes them,
 * and connection attempts fail with a clear timeout instead of hanging ~1m.
 */
function getOrCreatePool(): Pool {
  if (!globalForPrisma.pgPool) {
    globalForPrisma.pgPool = new Pool({
      connectionString,
      max: Number(process.env.PG_POOL_MAX ?? 10),
      idleTimeoutMillis: Number(process.env.PG_IDLE_TIMEOUT_MS ?? 20_000),
      connectionTimeoutMillis: Number(process.env.PG_CONN_TIMEOUT_MS ?? 15_000),
    });
  }
  return globalForPrisma.pgPool;
}

function getOrCreatePrisma(): PrismaClient {
  if (!globalForPrisma.prisma) {
    const pool = getOrCreatePool();
    globalForPrisma.prisma = new PrismaClient({
      adapter: new PrismaPg(pool),
    });
  }
  return globalForPrisma.prisma;
}

const prisma = getOrCreatePrisma();

export { prisma };
