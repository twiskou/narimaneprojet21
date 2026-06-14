import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  const alert = await prisma.alert.findFirst({ where: { id, userId: session.userId } });
  if (!alert) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const updated = await prisma.alert.update({ where: { id }, data: { isRead: true } });
  return NextResponse.json({ alert: updated });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;

  await prisma.alert.deleteMany({ where: { id, userId: session.userId } });
  return NextResponse.json({ ok: true });
}
