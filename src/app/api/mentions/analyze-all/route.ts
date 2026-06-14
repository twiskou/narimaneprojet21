import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeSentiment } from "@/lib/sentiment";

export async function POST() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const unanalyzed = await prisma.mention.findMany({
    where: { userId: session.userId, sentiment: null },
    take: 50,
  });

  let analyzed = 0;
  for (const mention of unanalyzed) {
    const result = await analyzeSentiment(mention.content, mention.language as "EN" | "FR" | "AR");
    await prisma.sentiment.create({
      data: { mentionId: mention.id, label: result.label, score: result.score },
    });
    analyzed++;
  }

  // Check reputation after batch
  const allSentiments = await prisma.sentiment.findMany({
    where: { mention: { userId: session.userId } },
    orderBy: { analyzedAt: "desc" },
    take: 20,
  });
  const negCount = allSentiments.filter((s) => s.label === "NEGATIVE").length;
  const total = allSentiments.length;
  if (total > 0 && negCount / total > 0.5) {
    await prisma.alert.create({
      data: {
        userId: session.userId,
        type: "REPUTATION_DROP",
        message: `🔴 Reputation alert: ${Math.round((negCount / total) * 100)}% of recent mentions are negative.`,
      },
    });
  }

  return NextResponse.json({ analyzed });
}
