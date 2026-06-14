import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'ADMIN' && session.role !== 'ANALYST')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const userId = session.userId;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(new Date().getDate() - 30);

    // KPIs
    const myAnalysesCount = await prisma.aIAnalysis.count({ where: { userId } });
    
    // Prisma relation check for null might need `is: null` or just query all mentions and filter, or `aiAnalysis: null`
    // Depending on Prisma version, it's usually `aiAnalysis: { is: null }` or just checking where it doesn't exist
    const pendingMentionsCount = await prisma.mention.count({ 
      where: { aiAnalysis: null } 
    });

    const avgScoreResult = await prisma.aIAnalysis.aggregate({ where: { userId }, _avg: { score: true } });
    const avgScore = avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score * 100) : 0;

    const avgRiskResult = await prisma.aIAnalysis.aggregate({ where: { userId }, _avg: { crisisRisk: true } });
    const avgRisk = avgRiskResult._avg.crisisRisk ? Math.round(avgRiskResult._avg.crisisRisk) : 0;

    const myActiveMissions = await prisma.mission.count({ where: { authorId: userId, status: 'ACTIVE' } });

    // Charts: Sentiment Pie
    const mySentiments = await prisma.aIAnalysis.groupBy({
      by: ['sentiment'],
      where: { userId },
      _count: { sentiment: true }
    });

    // Charts: Evolution Line
    const recentAnalyses = await prisma.aIAnalysis.findMany({
      where: { userId, createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true }
    });
    const analysesEvol: Record<string, number> = {};
    recentAnalyses.forEach(a => {
      const dateStr = a.createdAt.toISOString().split('T')[0];
      analysesEvol[dateStr] = (analysesEvol[dateStr] || 0) + 1;
    });

    // Charts: Top 5 risky mentions
    const topRisky = await prisma.aIAnalysis.findMany({
      where: { userId },
      orderBy: { crisisRisk: 'desc' },
      take: 5,
      include: { mention: { select: { content: true } } }
    });

    // Lists
    const myLatestMissions = await prisma.mission.findMany({
      where: { authorId: userId },
      take: 3,
      orderBy: { createdAt: 'desc' }
    });

    const pendingMentions = await prisma.mention.findMany({
      where: { aiAnalysis: null },
      take: 5,
      orderBy: { createdAt: 'desc' }
    });

    const myLatestAnalyses = await prisma.aIAnalysis.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { mention: { select: { content: true } } }
    });

    return NextResponse.json({
      kpis: {
        myAnalysesCount,
        pendingMentionsCount,
        avgScore,
        avgRisk,
        myActiveMissions
      },
      charts: {
        mySentiments,
        analysesEvolution: Object.entries(analysesEvol).map(([date, count]) => ({ date, count })),
        topRisky: topRisky.map(t => ({ id: t.id, risk: t.crisisRisk, content: t.mention.content.substring(0, 30) + '...' }))
      },
      lists: {
        myLatestMissions,
        pendingMentions,
        myLatestAnalyses
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
