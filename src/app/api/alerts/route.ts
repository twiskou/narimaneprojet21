import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const isReadParam = searchParams.get("isRead");

    const alerts = await prisma.alert.findMany({
      where: {
        userId: session.userId,
        ...(isReadParam !== null ? { isRead: isReadParam === "true" } : {}),
      },
      orderBy: { triggeredAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ alerts, total: alerts.length });
  } catch (error) {
    console.error("ALERTS ERROR:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
