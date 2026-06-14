import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const source = searchParams.get("source") || undefined;
  const language = searchParams.get("language") || undefined;
  const from = searchParams.get("from");
  const to = searchParams.get("to");
  const page = parseInt(searchParams.get("page") || "1");
  const limit = 20;

  const where = {
    userId: session.userId,
    ...(source && { source: source as "TWITTER" | "NEWS" | "MANUAL" }),
    ...(language && { language: language as "EN" | "FR" | "AR" }),
    ...(from || to
      ? { publishedAt: { ...(from && { gte: new Date(from) }), ...(to && { lte: new Date(to) }) } }
      : {}),
  };

  const [mentions, total] = await Promise.all([
    prisma.mention.findMany({
      where,
      include: { sentiment: true, aiAnalysis: true },
      orderBy: { publishedAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.mention.count({ where }),
  ]);

  return NextResponse.json({ mentions, total, page, pages: Math.ceil(total / limit) });
}

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { content, source, language, authorName, url } = await req.json();
  if (!content) return NextResponse.json({ error: "Content is required" }, { status: 400 });

  const mention = await prisma.mention.create({
    data: {
      content,
      source: source || "MANUAL",
      language: language || "EN",
      authorName,
      url,
      userId: session.userId,
    },
    include: { sentiment: true },
  });

  return NextResponse.json({ mention }, { status: 201 });
}
