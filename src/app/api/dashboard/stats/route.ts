import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const from = searchParams.get("from") ? new Date(searchParams.get("from")!) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const to = searchParams.get("to") ? new Date(searchParams.get("to")!) : new Date();

  const where = { userId: session.userId, publishedAt: { gte: from, lte: to } };

  const [totalMentions, sentiments] = await Promise.all([
    prisma.mention.count({ where }),
    prisma.sentiment.findMany({
      where: { mention: { ...where } },
      select: { label: true, score: true },
    }),
  ]);

  const positive = sentiments.filter((s) => s.label === "POSITIVE").length;
  const negative = sentiments.filter((s) => s.label === "NEGATIVE").length;
  const neutral = sentiments.filter((s) => s.label === "NEUTRAL").length;
  const analyzed = sentiments.length;

  // Reputation score: weighted 0-100
  const reputationScore = analyzed > 0
    ? Math.round(((positive * 1 + neutral * 0.5 + negative * 0) / analyzed) * 100)
    : 50;

  const unanalyzed = await prisma.mention.count({ where: { ...where, sentiment: null } });
  const unreadAlerts = await prisma.alert.count({ where: { userId: session.userId, isRead: false } });

  return NextResponse.json({
    reputationScore,
    totalMentions,
    analyzed,
    unanalyzed,
    unreadAlerts,
    sentimentBreakdown: { positive, negative, neutral },
  });
}
