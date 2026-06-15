import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const info: Record<string, unknown> = {
    node_env: process.env.NODE_ENV,
    turso_url_set: !!process.env.TURSO_DATABASE_URL,
    turso_url_prefix: process.env.TURSO_DATABASE_URL?.slice(0, 20) ?? "MISSING",
    turso_token_set: !!process.env.TURSO_AUTH_TOKEN,
  };

  try {
    // Step 1: test libsql client
    const { createClient } = await import("@libsql/client");
    const client = createClient({
      url: process.env.TURSO_DATABASE_URL!,
      authToken: process.env.TURSO_AUTH_TOKEN,
    });
    info.libsql_client_created = true;

    // Step 2: test prisma adapter
    const { PrismaLibSql } = await import("@prisma/adapter-libsql");
    const adapter = new PrismaLibSql(client);
    info.adapter_created = true;

    // Step 3: test prisma client
    const { PrismaClient } = await import("@prisma/client");
    const prisma = new PrismaClient({ adapter });
    info.prisma_client_created = true;

    // Step 4: try a real query
    const count = await prisma.user.count();
    info.user_count = count;
    info.status = "SUCCESS";

    await prisma.$disconnect();
  } catch (e: unknown) {
    info.error =
      e instanceof Error
        ? { message: e.message, name: e.name, stack: e.stack?.slice(0, 500) }
        : String(e);
    info.status = "FAILED";
  }

  return NextResponse.json(info, { status: 200 });
}
