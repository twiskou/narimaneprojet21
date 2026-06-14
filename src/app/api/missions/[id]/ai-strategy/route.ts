import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import OpenAI from 'openai';

const groq = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || 'dummy',
  baseURL: 'https://api.groq.com/openai/v1',
});

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await params;

    const mission = await prisma.mission.findUnique({
      where: { id },
      include: {
        targetProfile: true,
        activities: true,
        user: { select: { name: true, role: true } },
      },
    });

    if (!mission) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const activitiesText = mission.activities.map(
      (a) => `- ${a.label}${a.description ? ` : ${a.description}` : ''}`
    ).join('\n');

    const prompt = `
أنت مستشار أول متخصص في العلاقات العامة (PR)، وإدارة أزمات الاتصال، والاستخبارات الاستراتيجية.

قم بتحليل البيانات التالية لمهمة اتصالية وأنشئ تقريراً استراتيجياً شاملاً بصيغة JSON.

=== بيانات المهمة ===
عنوان المهمة: ${mission.title}
الوصف: ${mission.description || 'غير محدد'}
الحالة: ${mission.status}
أنشئت بواسطة: ${mission.user.name}

=== الملف الشخصي للهدف ===
الاسم: ${mission.targetProfile?.fullName || 'غير محدد'}
الدور / الوظيفة: ${mission.targetProfile?.role || 'غير محدد'}
المنظمة: ${mission.targetProfile?.organization || 'غير محددة'}
ملاحظات: ${mission.targetProfile?.notes || 'لا توجد'}

=== الأنشطة المخططة ===
${activitiesText || 'لم يتم تحديد أي نشاط'}

=== التعليمات ===
أنشئ كائن JSON صالحاً بهذا الهيكل بالضبط (بدون أي نص قبل أو بعد JSON):

{
  "executiveSummary": "ملخص تنفيذي احترافي من 3-4 جمل حول السياق والرهانات والأهداف.",
  "stakeholders": {
    "internal": ["قائمة أصحاب المصلحة الداخليين"],
    "external": ["قائمة أصحاب المصلحة الخارجيين"],
    "influencers": ["المؤثرون المحتملون"],
    "media": ["أنواع وسائل الإعلام المعنية"],
    "authorities": ["الجهات والسلطات المعنية"]
  },
  "communicationObjectives": {
    "shortTerm": ["أهداف قصيرة المدى (0-7 أيام)"],
    "mediumTerm": ["أهداف متوسطة المدى (1-4 أسابيع)"],
    "longTerm": ["أهداف طويلة المدى (1-6 أشهر)"]
  },
  "recommendedActions": [
    {
      "category": "فئة الإجراء (مثال: بيان صحفي)",
      "action": "وصف تفصيلي للإجراء الملموس",
      "priority": "HIGH|MEDIUM|LOW",
      "rationale": "مبرر في جملة واحدة"
    }
  ],
  "riskAssessment": {
    "score": 45,
    "level": "LOW|MEDIUM|HIGH|CRITICAL",
    "explanation": "شرح درجة المخاطرة في 2-3 جمل",
    "mainRisks": ["قائمة بأبرز المخاطر المحددة"]
  },
  "timeline": {
    "h24": ["الإجراءات خلال أول 24 ساعة"],
    "h48": ["الإجراءات بين 24-48 ساعة"],
    "week1": ["إجراءات الأسبوع الأول (3-7 أيام)"],
    "month1": ["إجراءات الشهر الأول (1-4 أسابيع)"]
  },
  "kpis": [
    {
      "indicator": "اسم المؤشر",
      "target": "القيمة المستهدفة القابلة للقياس",
      "measurement": "كيفية قياسه"
    }
  ],
  "aiRecommendations": ["التوصيات الاستراتيجية النهائية (3-5 نقاط رئيسية قابلة للتنفيذ)"]
}

القواعد:
- أجب فقط بالـ JSON الصالح، بدون علامات markdown.
- جميع القيم باللغة العربية الاحترافية.
- كن واقعياً وملموساً ومتكيفاً مع سياق المهمة.
- لـ "recommendedActions"، أنشئ على الأقل 6 إجراءات تغطي فئات مختلفة.
- لـ "kpis"، أنشئ على الأقل 5 مؤشرات قابلة للقياس.
- يجب أن تكون درجة المخاطرة عدداً صحيحاً بين 0 و100.
`;

    if (!process.env.GROQ_API_KEY) {
      return NextResponse.json({ error: 'GROQ_API_KEY non configurée' }, { status: 500 });
    }

    const response = await groq.chat.completions.create({
      model: 'llama-3.3-70b-versatile',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const raw = response.choices[0]?.message?.content || '';

    // Extract JSON from response (handle possible markdown code blocks)
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('No JSON found in response:', raw);
      return NextResponse.json({ error: 'Réponse IA invalide' }, { status: 500 });
    }

    const strategy = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ strategy, missionTitle: mission.title });
  } catch (error: any) {
    console.error('AI Strategy error:', error);
    return NextResponse.json(
      { error: error.message || 'خطأ داخلي في الخادم' },
      { status: 500 }
    );
  }
}
