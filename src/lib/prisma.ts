import { PrismaClient } from "@prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { createClient } from "@libsql/client";

declare global {
  var prisma: PrismaClient | undefined;
}

function getPrismaClient() {
  if (global.prisma) return global.prisma;

  const url = process.env.TURSO_DATABASE_URL;
  const authToken = process.env.TURSO_AUTH_TOKEN;

  console.log("TURSO_DATABASE_URL:", url ? "✅ found" : "❌ undefined");
  console.log("TURSO_AUTH_TOKEN:", authToken ? "✅ found" : "❌ undefined");

  const libsql = createClient({ url: url!, authToken: authToken! });
  const adapter = new PrismaLibSql(libsql);
  const client = new PrismaClient({ adapter });

  if (process.env.NODE_ENV !== "production") global.prisma = client;

  return client;
}

export const prisma = getPrismaClient();