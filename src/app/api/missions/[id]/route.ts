import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;
    const { status, title } = await req.json();

    const mission = await prisma.mission.findUnique({ where: { id } });
    if (!mission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only admin or the owner can update
    if (session.role !== 'ADMIN' && mission.authorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updated = await prisma.mission.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(title ? { title: title.trim() } : {}),
      },
      include: { user: { select: { name: true, role: true } } },
    });

    return NextResponse.json({ mission: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (session.role === 'VIEWER') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const { id } = await params;

    const mission = await prisma.mission.findUnique({ where: { id } });
    if (!mission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    // Only admin or the owner can delete
    if (session.role !== 'ADMIN' && mission.authorId !== session.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await prisma.mission.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
