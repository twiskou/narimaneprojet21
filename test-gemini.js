require("dotenv").config();

const apiKey = process.env.GROQ_API_KEY;
const OpenAI = require("openai");
const client = new OpenAI.default({ apiKey, baseURL: "https://api.groq.com/openai/v1" });

const MODEL = "llama-3.1-8b-instant";

async function testAnalysis(label, content) {
  console.log(`\n📝 Test: "${label}"`);
  try {
    const response = await client.chat.completions.create({
      model: MODEL,
      messages: [
        {
          role: "system",
          content: `You are an expert PR analyst for Algerian telecom companies. Return ONLY valid JSON:
{"sentiment":"POSITIVE"|"NEGATIVE"|"NEUTRAL","score":<float 0-1>,"crisisRisk":<float 0-1>,"summary":"<2-3 sentences>","keywords":["k1","k2","k3"]}`
        },
        { role: "user", content: `Analyze this mention:\n\n${content}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });
    const r = JSON.parse(response.choices[0]?.message?.content || "{}");
    console.log(`  Sentiment: ${r.sentiment}`);
    console.log(`  Score:     ${Math.round((r.score||0)*100)}%`);
    console.log(`  Crisis:    ${Math.round((r.crisisRisk||0)*100)}%`);
    console.log(`  Summary:   ${r.summary}`);
    console.log(`  Keywords:  ${r.keywords?.join(", ")}`);
  } catch (err) {
    console.error("  ❌ FAILED:", err.message);
  }
}

async function main() {
  await testAnalysis(
    "Positive (FR)",
    "Bravo à toute l'équipe pour la gestion rapide de la panne. Le service a été rétabli en un temps record"
  );
  await testAnalysis(
    "Negative/Crisis (FR)",
    "Des accusations de corruption visent plusieurs responsables de l'entreprise circulent actuellement sur les médias nationaux"
  );
  await testAnalysis(
    "Negative (FR)",
    "Internet en panne depuis ce matin à Alger. Impossible de travailler et aucun communiqué officiel de l'entreprise."
  );
}

main();
