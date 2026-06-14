import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from")
    ? new Date(searchParams.get("from")!)
    : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  const mentions = await prisma.mention.findMany({
    where: { userId: session.userId, publishedAt: { gte: from, lte: to } },
    include: { sentiment: true },
    orderBy: { publishedAt: "asc" },
  });

  // Group by day
  const grouped: Record<string, { positive: number; negative: number; neutral: number; total: number }> = {};

  for (const m of mentions) {
    const day = m.publishedAt.toISOString().split("T")[0];
    if (!grouped[day]) grouped[day] = { positive: 0, negative: 0, neutral: 0, total: 0 };
    grouped[day].total++;
    if (m.sentiment) {
      if (m.sentiment.label === "POSITIVE") grouped[day].positive++;
      else if (m.sentiment.label === "NEGATIVE") grouped[day].negative++;
      else grouped[day].neutral++;
    }
  }

  const dates = Object.keys(grouped).sort();
  const result = {
    dates,
    positive: dates.map((d) => grouped[d].positive),
    negative: dates.map((d) => grouped[d].negative),
    neutral: dates.map((d) => grouped[d].neutral),
    total: dates.map((d) => grouped[d].total),
  };

  return NextResponse.json(result);
}
