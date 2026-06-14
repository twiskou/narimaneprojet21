import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

// ─── Groq AI Analysis ────────────────────────────────────────────────────
async function analyzeWithGroq(content: string) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey || apiKey === "dummy") {
    console.error("[Groq] Missing GROQ_API_KEY in environment variables");
    return generateMockAnalysis(content);
  }

  const systemPrompt = `You are an expert PR and social media analyst specializing in Arabic and French content for Algerian telecom companies. 
Analyze the given text and return ONLY valid JSON (no markdown, no extra text) with this exact structure:
{
  "sentiment": "POSITIVE" | "NEGATIVE" | "NEUTRAL",
  "score": <float 0-1, confidence in sentiment>,
  "crisisRisk": <float 0-1, risk of PR crisis>,
  "summary": "<2-3 sentence summary in the same language as the input>",
  "keywords": ["keyword1", "keyword2", "keyword3"]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", // Fast and capable model
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Analyze this mention:\n\n${content}` },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" }, // Ensures valid JSON output
    });

    const raw = response.choices[0]?.message?.content || "";
    console.log("[Groq] Raw response:", raw.slice(0, 200));

    const parsed = JSON.parse(raw);
    console.log("[Groq] Successfully parsed:", parsed);
    return parsed;
  } catch (err: any) {
    console.error("[Groq] API call FAILED:", err?.message || err);
    console.warn("[Groq] Falling back to mock analysis!");
    return generateMockAnalysis(content);
  }
}

function generateMockAnalysis(content: string) {
  const text = content.toLowerCase();
  const isNegative = text.includes("كارثة") || text.includes("مقطوعة") || text.includes("سيئة") || text.includes("مشكلة") || text.includes("غضب")
    || text.includes("panne") || text.includes("corruption") || text.includes("mauvais") || text.includes("problème") || text.includes("impossible");
  const isPositive = text.includes("شكرا") || text.includes("ممتازة") || text.includes("جيد") || text.includes("رائع")
    || text.includes("bravo") || text.includes("excellent") || text.includes("merci") || text.includes("super") || text.includes("rétabli");
  
  return {
    sentiment: isNegative ? "NEGATIVE" : isPositive ? "POSITIVE" : "NEUTRAL",
    score: isNegative ? 0.85 : isPositive ? 0.88 : 0.65,
    crisisRisk: isNegative ? 0.78 : 0.08,
    summary: isNegative 
      ? "Le contenu exprime une insatisfaction ou un problème grave signalé par l'utilisateur." 
      : isPositive 
      ? "Le contenu exprime une satisfaction positive ou des félicitations envers l'entreprise."
      : "Le contenu est neutre, sans sentiment fort exprimé.",
    keywords: isNegative ? ["problème", "insatisfaction", "crise"] : isPositive ? ["satisfaction", "félicitations", "positif"] : ["neutre", "information"]
  };
}

// ─── POST /api/ai/analyze ────────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (session.role !== "ADMIN" && session.role !== "ANALYST") {
      return NextResponse.json({ error: "Forbidden – ANALYST or ADMIN only" }, { status: 403 });
    }

    const body = await req.json();
    const { mentionId, force } = body; 

    if (!mentionId) {
      return NextResponse.json({ error: "mentionId is required" }, { status: 400 });
    }

    const mention = await prisma.mention.findUnique({
      where: { id: mentionId },
      include: { aiAnalysis: true },
    });

    if (!mention) {
      return NextResponse.json({ error: "Mention not found" }, { status: 404 });
    }

    if (mention.aiAnalysis && !force) {
      return NextResponse.json({ analysis: mention.aiAnalysis, cached: true });
    }

    if (mention.aiAnalysis && force) {
      await prisma.aIAnalysis.delete({ where: { mentionId } });
    }

    const result = await analyzeWithGroq(mention.content);

    const sentiment = (["POSITIVE", "NEGATIVE", "NEUTRAL"].includes(result.sentiment)
      ? result.sentiment
      : "NEUTRAL") as "POSITIVE" | "NEGATIVE" | "NEUTRAL";

    const score = Math.min(1, Math.max(0, Number(result.score) || 0.5));
    const crisisRisk = Math.min(1, Math.max(0, Number(result.crisisRisk) || 0));
    const summary = String(result.summary || "").slice(0, 1000);
    const keywords = Array.isArray(result.keywords)
      ? result.keywords.map(String).slice(0, 10)
      : [];

    const analysis = await prisma.aIAnalysis.create({
      data: {
        mentionId,
        userId: session.userId,
        sentiment,
        score,
        crisisRisk,
        summary,
      },
    });

    await prisma.sentiment.upsert({
      where: { mentionId },
      create: { mentionId, label: sentiment, score },
      update: { label: sentiment, score },
    });

    if (crisisRisk > 0.7) {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'NEGATIVE_SPIKE',
          message: `خطر أزمة مرتفع (${Math.round(crisisRisk * 100)}%) — "${mention.content.slice(0, 60)}..."`,
          severity: crisisRisk > 0.85 ? 'HIGH' : 'MEDIUM',
          isRead: false,
        }
      });
    } else if (sentiment === 'NEGATIVE' && score > 0.8) {
      await prisma.alert.create({
        data: {
          userId: session.userId,
          type: 'REPUTATION_DROP',
          message: `محتوى سلبي قوي (${Math.round(score * 100)}%) — "${mention.content.slice(0, 60)}..."`,
          severity: 'MEDIUM',
          isRead: false,
        }
      });
    }

    return NextResponse.json({
      analysis: {
        ...analysis,
        keywords,
        crisisRiskPercent: Math.round(crisisRisk * 100),
        scorePercent: Math.round(score * 100),
      },
    });
  } catch (e: unknown) {
    console.error("[/api/ai/analyze] Error:", e);
    const message = e instanceof Error ? e.message : "Server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
