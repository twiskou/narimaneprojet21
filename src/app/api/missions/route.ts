import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession, verifyToken } from "@/lib/auth";

export async function GET(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const PAGE_SIZE = 15;

    const where: Record<string, unknown> = {};
    if (status) where.status = status;

    if (session.role === "ANALYST") {
      where.authorId = session.userId;
    }

    const [missions, total] = await Promise.all([
      prisma.mission.findMany({
        where,
        skip: (page - 1) * PAGE_SIZE,
        take: PAGE_SIZE,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, role: true } },
          targetProfile: true,
          activities: true,
        },
      }),
      prisma.mission.count({ where }),
    ]);

    return NextResponse.json({ missions, total, page });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Verify the user referenced in the session actually exists in the DB.
    // This guards against stale JWTs that point to users deleted after a DB reset.
    const userExists = await prisma.user.findUnique({ where: { id: session.userId } });
    if (!userExists) {
      return NextResponse.json(
        { error: "Session expirée. Veuillez vous reconnecter." },
        { status: 401 }
      );
    }

    const body = await req.json();

    if (!body.title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (!body.activities || !Array.isArray(body.activities) || body.activities.length === 0) {
      return NextResponse.json({ error: "Activities are required" }, { status: 400 });
    }

    const mission = await prisma.mission.create({
      data: {
        title: body.title,
        description: body.description || '',
        status: body.status || 'DRAFT',
        authorId: session.userId,
        authorNote: body.authorNote || '',
        targetProfile: body.targetProfile?.fullName
          ? {
              create: {
                fullName: body.targetProfile.fullName,
                role: body.targetProfile.role || '',
                organization: body.targetProfile.organization || '',
                fileUrl: body.targetProfile.fileUrl || '',
                fileType: body.targetProfile.fileType || '',
                notes: body.targetProfile.notes || '',
              }
            }
          : undefined,
        activities: {
          create: body.activities.map((a: any) => ({
            type: a.type,
            label: a.label || a.type,
            description: a.description || '',
          }))
        }
      },
      include: {
        targetProfile: true,
        activities: true,
      }
    });

    return NextResponse.json(mission, { status: 201 });
  } catch (error) {
    console.error('MISSION CREATE ERROR:', error);
    return NextResponse.json(
      { error: 'Database error', details: String(error) },
      { status: 500 }
    );
  }
}
