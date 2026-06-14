import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (session.role !== "ADMIN" && session.role !== "ANALYST") {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // احذف التنبيهات القديمة التجريبية
    await prisma.alert.deleteMany({
      where: { 
        userId: session.userId,
        message: { contains: '[TEST]' } 
      }
    });

    // خلق 3 تنبيهات تجريبية
    const testAlerts = await prisma.alert.createMany({
      data: [
        {
          userId: session.userId,
          type: 'NEGATIVE_SPIKE',
          message: '[TEST] ارتفاع مفاجئ في الكلام السلبي — 340% خلال آخر 3 ساعات',
          severity: 'HIGH',
          isRead: false,
        },
        {
          userId: session.userId,
          type: 'VOLUME_SURGE',
          message: '[TEST] حجم غير عادي من المنشورات — 200 منشور في ساعة واحدة',
          severity: 'MEDIUM',
          isRead: false,
        },
        {
          userId: session.userId,
          type: 'REPUTATION_DROP',
          message: '[TEST] انخفاض في السمعة — نزلت من 71 إلى 54 خلال 24 ساعة',
          severity: 'HIGH',
          isRead: true,
        },
      ]
    });

    return NextResponse.json({
      success: true,
      message: '3 alertes de test créées',
      count: testAlerts.count
    });

  } catch (error) {
    console.error('TEST ALERTS ERROR:', error);
    return NextResponse.json({ error: String(error) }, { status: 500 });
  }
}
