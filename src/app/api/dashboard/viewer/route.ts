import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(new Date().getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(new Date().getDate() - 30);

    // KPIs
    const avgScoreResult = await prisma.aIAnalysis.aggregate({ _avg: { score: true } });
    const reputationScore = avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score * 100) : 0;

    const newMentionsWeek = await prisma.mention.count({ where: { createdAt: { gte: sevenDaysAgo } } });

    const unreadAlerts = await prisma.alert.count({ where: { isRead: false } });

    const avgRiskResult = await prisma.aIAnalysis.aggregate({ _avg: { crisisRisk: true } });
    const crisisRisk = avgRiskResult._avg.crisisRisk ? Math.round(avgRiskResult._avg.crisisRisk) : 0;

    // Charts: Sentiments global
    const globalSentiments = await prisma.aIAnalysis.groupBy({
      by: ['sentiment'],
      _count: { sentiment: true }
    });

    // Charts: Reputation over time (Using avg score of analyses per day)
    const recentAnalyses = await prisma.aIAnalysis.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, score: true },
      orderBy: { createdAt: 'asc' }
    });
    
    const repEvol: Record<string, { sum: number, count: number }> = {};
    recentAnalyses.forEach(a => {
      const dateStr = a.createdAt.toISOString().split('T')[0];
      if (!repEvol[dateStr]) repEvol[dateStr] = { sum: 0, count: 0 };
      repEvol[dateStr].sum += (a.score * 100);
      repEvol[dateStr].count++;
    });

    const reputationEvolution = Object.entries(repEvol).map(([date, data]) => ({
      date,
      score: Math.round(data.sum / data.count)
    }));

    // Lists (No sensitive data like user emails)
    const latestMentions = await prisma.mention.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, content: true, createdAt: true, aiAnalysis: { select: { sentiment: true } } }
    });

    const latestAlerts = await prisma.alert.findMany({
      take: 3,
      orderBy: { triggeredAt: 'desc' },
      select: { id: true, type: true, message: true, triggeredAt: true }
    });

    const activeMissions = await prisma.mission.findMany({
      where: { status: 'ACTIVE' },
      take: 3,
      orderBy: { createdAt: 'desc' },
      select: { id: true, title: true, createdAt: true, user: { select: { name: true } } }
    });

    return NextResponse.json({
      kpis: {
        reputationScore,
        newMentionsWeek,
        unreadAlerts,
        crisisRisk
      },
      charts: {
        globalSentiments,
        reputationEvolution
      },
      lists: {
        latestMentions,
        latestAlerts,
        activeMissions
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
