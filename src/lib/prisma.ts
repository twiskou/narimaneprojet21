import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    adapter: new PrismaLibSql(
      createClient({
        url: process.env.TURSO_DATABASE_URL ?? (() => { throw new Error("TURSO_DATABASE_URL missing") })(),
        authToken: process.env.TURSO_AUTH_TOKEN ?? (() => { throw new Error("TURSO_AUTH_TOKEN missing") })(),
      })
    ),
  });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = globalForPrisma.prisma ??= createPrismaClient();