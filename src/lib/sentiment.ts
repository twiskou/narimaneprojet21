export type SentimentLabel = "POSITIVE" | "NEGATIVE" | "NEUTRAL";

export interface SentimentResult {
  label: SentimentLabel;
  score: number;
}

// ─── Keyword-based fallback scorer ───────────────────────────────────────────

const KEYWORDS = {
  EN: {
    positive: ["good","great","excellent","amazing","wonderful","fantastic","love","best","happy","success","improve","benefit","support","trust","strong"],
    negative: ["bad","terrible","awful","horrible","crisis","fail","corrupt","scandal","danger","threat","poor","wrong","fraud","attack","loss"],
  },
  FR: {
    positive: ["bon","bien","excellent","super","génial","réussi","succès","améliorer","confiance","positif","fort","bravo","parfait","heureux"],
    negative: ["mauvais","terrible","affreux","crise","échec","corrompu","scandale","danger","menace","pauvre","faux","fraude","attaque","perte"],
  },
  AR: {
    positive: ["جيد","ممتاز","رائع","نجاح","تحسن","ثقة","قوي","إيجابي","سعيد","أفضل","مبارك","تقدم","فوز","إنجاز","بارع"],
    negative: ["سيء","فشل","أزمة","فساد","فضيحة","خطر","تهديد","ضعيف","خاطئ","احتيال","هجوم","خسارة","كارثة","سلبي","مشكلة"],
  },
};

function keywordFallback(text: string, language: "EN" | "FR" | "AR"): SentimentResult {
  const lower = text.toLowerCase();
  const kw = KEYWORDS[language] || KEYWORDS.EN;
  let pos = 0, neg = 0;
  kw.positive.forEach((w) => { if (lower.includes(w)) pos++; });
  kw.negative.forEach((w) => { if (lower.includes(w)) neg++; });
  if (pos === 0 && neg === 0) return { label: "NEUTRAL", score: 0.6 };
  if (pos > neg) return { label: "POSITIVE", score: Math.min(0.95, 0.6 + pos * 0.1) };
  if (neg > pos) return { label: "NEGATIVE", score: Math.min(0.95, 0.6 + neg * 0.1) };
  return { label: "NEUTRAL", score: 0.55 };
}

// ─── HuggingFace model map ────────────────────────────────────────────────────

const HF_MODELS = {
  AR: "CAMeL-Lab/bert-base-arabic-camelbert-msa-sentiment",
  FR: "nlptown/bert-base-multilingual-uncased-sentiment",
  EN: "cardiffnlp/twitter-roberta-base-sentiment-latest",
};

const HF_BASE = "https://api-inference.huggingface.co/models";

function normalizeLabel(raw: string): SentimentLabel {
  const r = raw.toUpperCase();
  if (r.includes("POS") || r === "5 STARS" || r === "4 STARS") return "POSITIVE";
  if (r.includes("NEG") || r === "1 STAR" || r === "2 STARS") return "NEGATIVE";
  return "NEUTRAL";
}

async function queryHuggingFace(
  text: string,
  language: "EN" | "FR" | "AR"
): Promise<SentimentResult | null> {
  const token = process.env.HF_API_TOKEN;
  if (!token) return null;

  try {
    const res = await fetch(`${HF_BASE}/${HF_MODELS[language]}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ inputs: text.slice(0, 512) }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) return null;

    const data = await res.json();
    // HF returns [[{label, score},...]] or [{label,score},...]
    const results: { label: string; score: number }[] = Array.isArray(data[0])
      ? data[0]
      : data;

    if (!results?.length) return null;

    const top = results.reduce((a, b) => (a.score > b.score ? a : b));
    return { label: normalizeLabel(top.label), score: top.score };
  } catch {
    return null;
  }
}

// ─── Main export ──────────────────────────────────────────────────────────────

export async function analyzeSentiment(
  text: string,
  language: "EN" | "FR" | "AR" = "EN"
): Promise<SentimentResult> {
  const hfResult = await queryHuggingFace(text, language);
  if (hfResult) return hfResult;
  return keywordFallback(text, language);
}
