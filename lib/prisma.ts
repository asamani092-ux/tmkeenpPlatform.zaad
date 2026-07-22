import { Pool } from "pg";
import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  pgPool?: Pool;
};

function getConnectionString(): string {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }
  return connectionString;
}

function createPool(): Pool {
  const pool = new Pool({
    connectionString: getConnectionString(),
    max: 10,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 10_000,
    keepAlive: true,
  });

  // Idle clients can die when prisma local / Postgres restarts (P1017).
  pool.on("error", (err) => {
    console.error("[pg] idle client error:", err.message);
  });

  return pool;
}

function createPrismaClient(): PrismaClient {
  const pool = globalForPrisma.pgPool ?? createPool();
  globalForPrisma.pgPool = pool;

  const adapter = new PrismaPg(pool, {
    onPoolError: (err) => console.error("[prisma-pg] pool:", err.message),
    onConnectionError: (err) => console.error("[prisma-pg] conn:", err.message),
  });

  return new PrismaClient({ adapter });
}

/**
 * Recreate pool + client after P1017 ("Server has closed the connection").
 * O(1) time/space — tears down at most one pool.
 */
export async function resetPrismaClient(): Promise<PrismaClient> {
  const old = globalForPrisma.pgPool;
  globalForPrisma.pgPool = undefined;
  globalForPrisma.prisma = undefined;
  if (old) {
    try {
      await old.end();
    } catch {
      /* ignore dispose races */
    }
  }
  const next = createPrismaClient();
  globalForPrisma.prisma = next;
  return next;
}

function isClosedConnectionError(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; message?: string };
  return (
    e.code === "P1017" ||
    e.code === "P1001" ||
    (typeof e.message === "string" &&
      (e.message.includes("Server has closed the connection") ||
        e.message.includes("Connection terminated") ||
        e.message.includes("Can't reach database server")))
  );
}

/**
 * Run a DB block; on dropped connection, rebuild the pool once and retry.
 * Time O(T) for the work; Space O(1) extra.
 */
export async function withPrismaRetry<T>(fn: (db: PrismaClient) => Promise<T>): Promise<T> {
  const db = globalForPrisma.prisma ?? createPrismaClient();
  globalForPrisma.prisma = db;
  try {
    return await fn(db);
  } catch (err) {
    if (!isClosedConnectionError(err)) throw err;
    console.warn("[prisma] connection lost — resetting pool and retrying once");
    const fresh = await resetPrismaClient();
    return await fn(fresh);
  }
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
