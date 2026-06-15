import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

// ---------------------------------------------------------------------------
// Lazy singleton — the client is created on the FIRST database call, not at
// module import time.  This guarantees that process.env is fully populated
// (Vercel injects env vars before request handlers run, but AFTER the module
// graph is loaded in some Next.js 16 optimization passes).
// ---------------------------------------------------------------------------

declare global {
  // eslint-disable-next-line no-var
  var __prisma: PrismaClient | undefined;
}

function buildPrismaClient(): PrismaClient {
  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  if (!url) {
    throw new Error(
      `[prisma] TURSO_DATABASE_URL is not set. ` +
        `Available env keys: ${Object.keys(process.env)
          .filter((k) => k.startsWith("TURSO"))
          .join(", ") || "none"}`
    );
  }

  const libsql = createClient({ url, authToken: authToken ?? "" });
  const adapter = new PrismaLibSql(libsql);
  return new PrismaClient({ adapter });
}

// Use globalThis so the singleton survives Next.js hot-reloads in dev.
// In production each serverless invocation gets a fresh process anyway.
function getPrisma(): PrismaClient {
  if (!globalThis.__prisma) {
    globalThis.__prisma = buildPrismaClient();
  }
  return globalThis.__prisma;
}

// Export a Proxy so every property access (prisma.user, prisma.mention, …)
// is deferred until the first actual database call inside a request handler.
export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop: string | symbol) {
    return (getPrisma() as unknown as Record<string | symbol, unknown>)[prop];
  },
});