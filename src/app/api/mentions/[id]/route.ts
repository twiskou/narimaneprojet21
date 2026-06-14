import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { analyzeSentiment } from "@/lib/sentiment";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const mention = await prisma.mention.findFirst({ where: { id, userId: session.userId } });
  if (!mention) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.mention.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const mention = await prisma.mention.findFirst({ where: { id, userId: session.userId } });
  if (!mention) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const result = await analyzeSentiment(mention.content, mention.language as "EN" | "FR" | "AR");

  const sentiment = await prisma.sentiment.upsert({
    where: { mentionId: id },
    update: { label: result.label, score: result.score },
    create: { mentionId: id, label: result.label, score: result.score },
  });

  // Check for negative spike — last 10 mentions, if ≥4 are negative, create alert
  const recent = await prisma.sentiment.findMany({
    where: { mention: { userId: session.userId } },
    orderBy: { analyzedAt: "desc" },
    take: 10,
  });

  const negCount = recent.filter((s) => s.label === "NEGATIVE").length;
  if (negCount >= 4) {
    const existing = await prisma.alert.findFirst({
      where: {
        userId: session.userId,
        type: "NEGATIVE_SPIKE",
        isRead: false,
        triggeredAt: { gte: new Date(Date.now() - 60 * 60 * 1000) },
      },
    });
    if (!existing) {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: "NEGATIVE_SPIKE",
          message: `⚠️ Negative sentiment spike detected: ${negCount} of your last 10 mentions are negative.`,
        },
      });
    }
  }

  return NextResponse.json({ sentiment });
}
