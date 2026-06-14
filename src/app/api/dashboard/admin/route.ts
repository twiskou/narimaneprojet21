import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(now.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(now.getDate() - 30);

    // KPI: Users
    const totalUsers = await prisma.user.count();
    const newUsersWeek = await prisma.user.count({ where: { createdAt: { gte: sevenDaysAgo } } });

    // KPI: Mentions
    const totalMentions = await prisma.mention.count();
    const newMentionsWeek = await prisma.mention.count({ where: { createdAt: { gte: sevenDaysAgo } } });
    const oldMentionsWeek = await prisma.mention.count({ 
      where: { createdAt: { gte: new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000), lt: sevenDaysAgo } } 
    });
    const mentionVariation = oldMentionsWeek === 0 ? 100 : Math.round(((newMentionsWeek - oldMentionsWeek) / oldMentionsWeek) * 100);

    // KPI: Reputation
    const avgScoreResult = await prisma.aIAnalysis.aggregate({ _avg: { score: true } });
    const reputationScore = avgScoreResult._avg.score ? Math.round(avgScoreResult._avg.score * 100) : 0;

    // KPI: Alerts
    const unreadAlerts = await prisma.alert.count({ where: { isRead: false } });

    // KPI: Crisis Risk
    const avgRiskResult = await prisma.aIAnalysis.aggregate({ _avg: { crisisRisk: true } });
    const crisisRisk = avgRiskResult._avg.crisisRisk ? Math.round(avgRiskResult._avg.crisisRisk) : 0;

    // KPI: Active Missions
    const activeMissions = await prisma.mission.count({ where: { status: 'ACTIVE' } });

    // Charts: Mentions by Source
    const mentionsBySource = await prisma.mention.groupBy({
      by: ['source'],
      _count: { source: true },
    });

    // Charts: Users by Role
    const usersByRole = await prisma.user.groupBy({
      by: ['role'],
      _count: { role: true },
    });

    // Charts: Sentiment Evolution (Last 30 days)
    // Note: SQLite doesn't have great date grouping functions natively in Prisma groupBy, 
    // we fetch last 30 days and group in memory for simplicity.
    const recentAnalyses = await prisma.aIAnalysis.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true, sentiment: true },
      orderBy: { createdAt: 'asc' }
    });

    const sentimentEvol: Record<string, { date: string; positive: number; neutral: number; negative: number }> = {};
    recentAnalyses.forEach(a => {
      const dateStr = a.createdAt.toISOString().split('T')[0];
      if (!sentimentEvol[dateStr]) {
        sentimentEvol[dateStr] = { date: dateStr, positive: 0, neutral: 0, negative: 0 };
      }
      if (a.sentiment === 'POSITIVE') sentimentEvol[dateStr].positive++;
      else if (a.sentiment === 'NEUTRAL') sentimentEvol[dateStr].neutral++;
      else if (a.sentiment === 'NEGATIVE') sentimentEvol[dateStr].negative++;
    });

    // Lists
    const latestUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, email: true, role: true, orgName: true, createdAt: true }
    });

    const latestMissions = await prisma.mission.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const latestAlerts = await prisma.alert.findMany({
      take: 5,
      orderBy: { triggeredAt: 'desc' },
      select: { id: true, type: true, message: true, triggeredAt: true, isRead: true }
    });

    return NextResponse.json({
      kpis: {
        totalUsers, newUsersWeek,
        totalMentions, mentionVariation,
        reputationScore,
        unreadAlerts,
        crisisRisk,
        activeMissions
      },
      charts: {
        mentionsBySource,
        usersByRole,
        sentimentEvolution: Object.values(sentimentEvol)
      },
      lists: {
        latestUsers,
        latestMissions,
        latestAlerts
      }
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
