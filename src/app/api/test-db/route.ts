import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    TURSO_DATABASE_URL: process.env.TURSO_DATABASE_URL ?? "❌ undefined",
    TURSO_AUTH_TOKEN: process.env.TURSO_AUTH_TOKEN ? "✅ found" : "❌ undefined",
  });
}