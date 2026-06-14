import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.GROQ_API_KEY || "dummy",
  baseURL: "https://api.groq.com/openai/v1",
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid messages format" }, { status: 400 });
    }

    const systemMessage = {
      role: "system",
      content: `أنت مساعد ذكي لمنصة NARP-SMART، منصة هندسة العلاقات العامة الذكية التي تجمع بين قوة الذكاء الاصطناعي وتحليل البيانات الضخمة. 
مهمتك هي مساعدة الزوار والإجابة على استفساراتهم حول المنصة وميزاتها بطريقة احترافية ولطيفة.
أجب باللغة العربية أو الفرنسية أو الإنجليزية حسب لغة المستخدم. كن مختصراً ومفيداً.`
    };

    const apiMessages = [systemMessage, ...messages.map((m: any) => ({
      role: m.role,
      content: m.content
    }))];

    if (!process.env.GROQ_API_KEY) {
       return NextResponse.json({ reply: "عذراً، يرجى إعداد مفتاح GROQ API أولاً." });
    }

    const response = await openai.chat.completions.create({
      model: "llama-3.1-8b-instant", // Modèle ultra rapide de Meta fourni par Groq
      messages: apiMessages,
      temperature: 0.7,
      max_tokens: 500,
    });

    const reply = response.choices[0]?.message?.content || "عذراً، لم أتمكن من معالجة طلبك.";

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error("Chat API error:", error);
    return NextResponse.json({ error: error.message || "Something went wrong" }, { status: 500 });
  }
}
