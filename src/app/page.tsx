"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PRBackground from "@/components/PRBackground";
import Chatbot from "@/components/Chatbot";

type Lang = "AR" | "FR" | "EN";

const LANGS: Lang[] = ["AR", "FR", "EN"];
const FLAG: Record<Lang, string> = { AR: "🇸🇦", FR: "🇫🇷", EN: "🇺🇸" };

const content: Record<Lang, {
  dir: "rtl" | "ltr";
  badge: string;
  tagline: string;
  title: string;
  titleHighlight: string;
  desc: string;
  features: [string, string][];
  login: string;
  register: string;
  explore: string;
  langNames: Record<Lang, string>;
  stats: [string, string][];
  powered: string;
  darkMode: string;
  lightMode: string;
}> = {
  AR: {
    dir: "rtl",
    badge: "🤖 مدعوم بالذكاء الاصطناعي",
    tagline: "منصة هندسة العلاقات العامة الذكية",
    title: "مرحباً بك في",
    titleHighlight: "NARP-SMART",
    desc: "منصة رقمية متقدمة تجمع بين قوة الذكاء الاصطناعي وتحليل البيانات الضخمة لتمكين المؤسسات من فهم جمهورها، رصد سمعتها، وتحسين استراتيجياتها الاتصالية في الوقت الحقيقي. توفر",
    features: [
      ["📊", "تحليل المعلومات الفوري"],
      ["🔔", "الإنذار المبكر للأزمات"],
      ["🔒", "أمان تام للبيانات"],
    ],
    login: "تسجيل الدخول",
    register: "إنشاء حساب جديد",
    explore: "استكشف المنصة",
    langNames: { AR: "العربية", FR: "Français", EN: "English" },
    stats: [["12,540+", "إشارة رصد"], ["97%", "دقة التحليل"], ["24/7", "مراقبة مستمرة"]],
    powered: "مدعوم بأحدث تقنيات الذكاء الاصطناعي",
    darkMode: "الوضع الليلي",
    lightMode: "الوضع النهاري",
  },
  FR: {
    dir: "ltr",
    badge: "🤖 Propulsé par l'IA",
    tagline: "Plateforme d'Ingénierie RP Intelligente",
    title: "Bienvenue sur",
    titleHighlight: "NARP-SMART",
    desc: "Une plateforme numérique avancée qui combine la puissance de l'intelligence artificielle et l'analyse des mégadonnées pour permettre aux institutions de comprendre leur audience, surveiller leur réputation et optimiser leurs stratégies de communication en temps réel.",
    features: [
      ["📊", "Analyse instantanée des informations"],
      ["🔔", "Alerte précoce des crises"],
      ["🔒", "Sécurité totale des données"],
    ],
    login: "Se connecter",
    register: "Créer un compte",
    explore: "Explorer la plateforme",
    langNames: { AR: "العربية", FR: "Français", EN: "English" },
    stats: [["12 540+", "Mentions suivies"], ["97%", "Précision d'analyse"], ["24/7", "Surveillance continue"]],
    powered: "Propulsé par les dernières technologies d'IA",
    darkMode: "Mode sombre",
    lightMode: "Mode clair",
  },
  EN: {
    dir: "ltr",
    badge: "🤖 AI-Powered Platform",
    tagline: "Intelligent PR Engineering Platform",
    title: "Welcome to",
    titleHighlight: "NARP-SMART",
    desc: "An advanced digital platform combining the power of artificial intelligence and big data analytics to empower institutions to understand their audience, monitor their reputation, and optimize communication strategies in real time.",
    features: [
      ["📊", "Real-time Information Analysis"],
      ["🔔", "Crisis Early Warning"],
      ["🔒", "Full Data Security"],
    ],
    login: "Sign In",
    register: "Create Account",
    explore: "Explore Platform",
    langNames: { AR: "العربية", FR: "Français", EN: "English" },
    stats: [["12,540+", "Mentions Tracked"], ["97%", "Analysis Accuracy"], ["24/7", "Continuous Monitoring"]],
    powered: "Powered by cutting-edge AI technology",
    darkMode: "Dark Mode",
    lightMode: "Light Mode",
  },
};

export default function WelcomePage() {
  const [lang, setLang]       = useState<Lang>("AR");
  const [dark, setDark]       = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [animIdx, setAnimIdx] = useState(0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    const t = setInterval(() => setAnimIdx(i => (i + 1) % 4), 2500);
    return () => clearInterval(t);
  }, []);

  const c   = content[lang];
  const dir = c.dir;

  // ── Theme tokens ──
  const bg        = dark ? "#0b1015"                       : "#f0f7f4";
  const headerBg  = dark ? "rgba(11,16,21,0.88)"          : "rgba(240,247,244,0.92)";
  const cardBg    = dark ? "rgba(255,255,255,0.03)"        : "rgba(255,255,255,0.85)";
  const cardBorder= dark ? "rgba(255,255,255,0.07)"        : "rgba(45,139,186,0.18)";
  const textMain  = dark ? "#ddeee8"                       : "#0e2620";
  const textMuted = dark ? "#8faaa0"                       : "#3d6b5c";
  const chipBg    = dark ? "rgba(255,255,255,0.04)"        : "rgba(45,139,186,0.07)";
  const chipBorder= dark ? "rgba(255,255,255,0.08)"        : "rgba(45,139,186,0.2)";
  const chipActive= dark ? "rgba(45,139,186,0.18)"         : "rgba(45,139,186,0.15)";
  const chipActiveBorder = dark ? "rgba(45,139,186,0.5)"  : "rgba(45,139,186,0.45)";
  const loginBg   = dark ? "rgba(45,139,186,0.08)"         : "rgba(45,139,186,0.1)";
  const loginBorder = dark ? "rgba(45,139,186,0.35)"       : "rgba(45,139,186,0.4)";
  const exploreBorder = dark ? "rgba(255,255,255,0.1)"    : "rgba(0,0,0,0.12)";
  const exploreColor  = dark ? "#8faaa0"                  : "#3d6b5c";
  const headerBorder  = dark ? "rgba(45,139,186,0.15)"    : "rgba(45,139,186,0.2)";
  const dropBg    = dark ? "#131f28"                       : "#ffffff";
  const dropBorder= dark ? "rgba(45,139,186,0.2)"         : "rgba(45,139,186,0.25)";
  const scrollTrack = dark ? "#0b1015"                    : "#e8f3ef";
  const glowL     = dark ? "rgba(45,139,186,0.12)"        : "rgba(45,139,186,0.08)";
  const glowR     = dark ? "rgba(34,199,120,0.1)"         : "rgba(34,199,120,0.07)";
  const themeBtnBg= dark ? "rgba(255,255,255,0.06)"       : "rgba(0,0,0,0.05)";
  const themeBtnBorder = dark ? "rgba(255,255,255,0.12)"  : "rgba(0,0,0,0.1)";

  if (!mounted) return null;

  return (
    <div
      dir={dir}
      style={{
        minHeight: "100vh",
        background: bg,
        color: textMain,
        fontFamily: "'Inter','Segoe UI',sans-serif",
        overflowX: "hidden",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        transition: "background 0.4s ease, color 0.4s ease",
      }}
    >
      <PRBackground dark={dark} />

      {/* ── Header ── */}
      <header
        style={{
          position: "fixed",
          top: 0, left: 0, right: 0,
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 28px",
          height: 64,
          background: headerBg,
          backdropFilter: "blur(20px)",
          borderBottom: `1px solid ${headerBorder}`,
          transition: "background 0.4s ease, border-color 0.4s ease",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            position: "relative", width: 64, height: 64,
            flexShrink: 0,
          }}>
            <Image src="/logo.png" alt="NARP-SMART Logo" fill style={{ objectFit: "contain" }} priority />
          </div>
        </div>

        {/* Right controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>

          {/* ── Theme toggle ── */}
          <button
            onClick={() => setDark(!dark)}
            title={dark ? c.lightMode : c.darkMode}
            style={{
              display: "flex", alignItems: "center", gap: 6,
              padding: "7px 13px", borderRadius: 10,
              background: themeBtnBg,
              border: `1px solid ${themeBtnBorder}`,
              color: textMain,
              fontSize: 13, fontWeight: 600, cursor: "pointer",
              transition: "all 0.3s ease",
              whiteSpace: "nowrap",
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLButtonElement).style.background = dark
                ? "rgba(255,215,0,0.12)" : "rgba(45,139,186,0.12)";
              (e.currentTarget as HTMLButtonElement).style.borderColor = dark
                ? "rgba(255,215,0,0.35)" : "rgba(45,139,186,0.4)";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLButtonElement).style.background = themeBtnBg;
              (e.currentTarget as HTMLButtonElement).style.borderColor = themeBtnBorder;
            }}
          >
            <span style={{ fontSize: 16, lineHeight: 1, transition: "transform 0.4s ease",
              transform: dark ? "rotate(0deg)" : "rotate(180deg)" }}>
              {dark ? "☀️" : "🌙"}
            </span>
            <span style={{ color: textMuted, fontSize: 12 }}>
              {dark ? c.lightMode : c.darkMode}
            </span>
          </button>

          {/* Language switcher */}
          <div style={{ position: "relative" }}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "7px 14px", borderRadius: 10,
                background: "rgba(45,139,186,0.08)",
                border: `1px solid ${loginBorder}`,
                color: textMain,
                fontSize: 13, fontWeight: 700, cursor: "pointer",
                transition: "all 0.2s",
              }}
            >
              {FLAG[lang]} {c.langNames[lang]}
              <span style={{ fontSize: 9, opacity: 0.6, marginInlineStart: 2 }}>▼</span>
            </button>
            {langOpen && (
              <div style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                [dir === "rtl" ? "left" : "right"]: 0,
                background: dropBg,
                border: `1px solid ${dropBorder}`,
                borderRadius: 14, padding: 6, minWidth: 160,
                boxShadow: "0 16px 48px rgba(0,0,0,0.3)",
                zIndex: 200,
                transition: "background 0.3s ease",
              }}>
                {LANGS.map(l => (
                  <button
                    key={l}
                    onClick={() => { setLang(l); setLangOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      width: "100%", padding: "10px 14px", borderRadius: 10,
                      fontSize: 13, border: "none",
                      background: lang === l ? "rgba(45,139,186,0.18)" : "transparent",
                      color: lang === l ? "#4dbde8" : textMain,
                      cursor: "pointer", fontWeight: lang === l ? 700 : 400,
                      transition: "all 0.15s", textAlign: "start",
                    }}
                    onMouseEnter={e => { if (lang !== l) (e.currentTarget as HTMLButtonElement).style.background = dark ? "rgba(255,255,255,0.05)" : "rgba(45,139,186,0.06)"; }}
                    onMouseLeave={e => { if (lang !== l) (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                  >
                    <span style={{ fontSize: 18 }}>{FLAG[l]}</span>
                    {c.langNames[l]}
                    {lang === l && <span style={{ marginInlineStart: "auto", fontSize: 11 }}>✓</span>}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Main ── */}
      <main style={{
        flex: 1,
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center",
        padding: "100px 24px 60px",
        position: "relative", zIndex: 1,
        textAlign: "center",
      }}>

        {/* Badge */}
        <div style={{
          display: "inline-flex", alignItems: "center", gap: 8,
          background: "rgba(34,199,120,0.08)",
          border: "1px solid rgba(34,199,120,0.3)",
          borderRadius: 100, padding: "6px 18px",
          marginBottom: 32, fontSize: 13,
          color: "#22c778", fontWeight: 600,
          animation: "fadeInDown 0.6s ease both",
        }}>
          {c.badge}
        </div>

        {/* Logo + Name */}
        <div style={{
          display: "flex", flexDirection: "column",
          alignItems: "center", gap: 24,
          marginBottom: 32,
          animation: "fadeInUp 0.7s ease 0.1s both",
        }}>
          {/* Logo image with theme-reactive glow */}
          <div style={{
            position: "relative", width: 220, height: 220,
            borderRadius: 28, overflow: "hidden",
            background: dark ? "rgba(255,255,255,0.03)" : "rgba(255,255,255,0.5)",
            backdropFilter: "blur(12px)",
            boxShadow: dark
              ? "0 0 0 1px rgba(255,255,255,0.08), 0 24px 60px rgba(34,199,120,0.2), 0 0 80px rgba(45,139,186,0.1)"
              : "0 0 0 1px rgba(45,139,186,0.15), 0 20px 50px rgba(34,199,120,0.1)",
            border: "1px solid rgba(45,139,186,0.2)",
            transition: "box-shadow 0.4s ease",
            padding: 8,
          }}>
            <Image src="/logo.png" alt="NARP-SMART Logo" fill style={{ objectFit: "contain" }} priority />
          </div>

          <div>
            <p style={{ fontSize: 15, color: textMuted, marginBottom: 8, fontWeight: 500, letterSpacing: "0.05em", transition: "color 0.4s" }}>
              {c.title}
            </p>
            <h1 style={{
              fontSize: "clamp(48px, 8vw, 80px)", fontWeight: 900, lineHeight: 1,
              background: "linear-gradient(135deg, #2d8bba 0%, #22c778 50%, #6bcdae 100%)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
              letterSpacing: "-0.03em", margin: 0,
            }}>
              {c.titleHighlight}
            </h1>
            <p style={{ fontSize: 14, color: "#4dbde8", marginTop: 10, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>
              {c.tagline}
            </p>
          </div>
        </div>

        {/* Description */}
        <p style={{
          fontSize: "clamp(15px, 2vw, 18px)", color: textMuted,
          lineHeight: 1.85, maxWidth: 680, marginBottom: 40,
          animation: "fadeInUp 0.7s ease 0.2s both",
          transition: "color 0.4s ease",
        }}>
          {c.desc}
        </p>

        {/* Feature chips */}
        <div style={{
          display: "flex", flexWrap: "wrap", gap: 10,
          justifyContent: "center", marginBottom: 44,
          animation: "fadeInUp 0.7s ease 0.3s both",
        }}>
          {c.features.map(([icon, label], i) => (
            <div key={label} style={{
              display: "flex", alignItems: "center", gap: 8,
              padding: "8px 16px", borderRadius: 100,
              background: i === animIdx ? chipActive : chipBg,
              border: `1px solid ${i === animIdx ? chipActiveBorder : chipBorder}`,
              fontSize: 13,
              color: i === animIdx ? "#4dbde8" : textMuted,
              fontWeight: i === animIdx ? 700 : 400,
              transition: "all 0.4s ease",
              transform: i === animIdx ? "scale(1.06)" : "scale(1)",
            }}>
              <span>{icon}</span>
              <span>{label}</span>
            </div>
          ))}
        </div>

        {/* CTA Buttons */}
        <div style={{
          display: "flex", gap: 14, flexWrap: "wrap",
          justifyContent: "center", marginBottom: 36,
          animation: "fadeInUp 0.7s ease 0.4s both",
        }}>
          <Link href="/welcome" style={{
            padding: "18px 48px", borderRadius: 16,
            background: "linear-gradient(135deg, #2d8bba, #22c778)",
            color: "#ffffff", textDecoration: "none",
            fontSize: 18, fontWeight: 800,
            boxShadow: "0 12px 40px rgba(34,199,120,0.4)",
            display: "flex", alignItems: "center", gap: 12,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            letterSpacing: "0.02em",
            position: "relative",
            overflow: "hidden"
          }}
            onMouseEnter={e => { 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px) scale(1.02)"; 
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 20px 50px rgba(34,199,120,0.6)"; 
            }}
            onMouseLeave={e => { 
              (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0) scale(1)"; 
              (e.currentTarget as HTMLAnchorElement).style.boxShadow = "0 12px 40px rgba(34,199,120,0.4)"; 
            }}
          >
            <span style={{ fontSize: 24 }}>🚀</span> 
            {c.explore}
          </Link>
        </div>

        {/* Stats */}
        <div style={{
          display: "flex", gap: 24, justifyContent: "center", flexWrap: "wrap",
          animation: "fadeInUp 0.7s ease 0.5s both",
        }}>
          {c.stats.map(([val, label]) => (
            <div key={label} style={{
              textAlign: "center", padding: "14px 24px", borderRadius: 16,
              background: cardBg, border: `1px solid ${cardBorder}`,
              backdropFilter: "blur(8px)",
              transition: "background 0.4s ease, border-color 0.4s ease",
            }}>
              <div style={{
                fontSize: 26, fontWeight: 900,
                background: "linear-gradient(135deg,#2d8bba,#22c778)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
                marginBottom: 4,
              }}>{val}</div>
              <div style={{ fontSize: 12, color: textMuted, fontWeight: 500, transition: "color 0.4s" }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Powered by */}
        <p style={{
          marginTop: 40, fontSize: 12,
          color: dark ? "rgba(143,170,160,0.45)" : "rgba(61,107,92,0.5)",
          display: "flex", alignItems: "center", gap: 6, justifyContent: "center",
          animation: "fadeInUp 0.7s ease 0.6s both",
          transition: "color 0.4s ease",
        }}>
          <span>⚡</span>{c.powered}<span>⚡</span>
        </p>
      </main>

      {/* Glow orbs */}
      <div style={{
        position: "fixed", top: "20%",
        [dir === "rtl" ? "right" : "left"]: "-5%",
        width: 400, height: 400, borderRadius: "50%",
        background: `radial-gradient(circle, ${glowL} 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0, transition: "background 0.5s ease",
      }} />
      <div style={{
        position: "fixed", bottom: "10%",
        [dir === "rtl" ? "left" : "right"]: "-5%",
        width: 500, height: 500, borderRadius: "50%",
        background: `radial-gradient(circle, ${glowR} 0%, transparent 70%)`,
        pointerEvents: "none", zIndex: 0, transition: "background 0.5s ease",
      }} />

      <style>{`
        @keyframes fadeInDown {
          from { opacity:0; transform:translateY(-16px); }
          to   { opacity:1; transform:translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity:0; transform:translateY(24px); }
          to   { opacity:1; transform:translateY(0); }
        }
        * { box-sizing:border-box; margin:0; padding:0; }
        html { scroll-behavior:smooth; }
        ::-webkit-scrollbar { width:6px; }
        ::-webkit-scrollbar-track { background:${scrollTrack}; }
        ::-webkit-scrollbar-thumb { background:#2d8bba44; border-radius:3px; }
      `}</style>
      <Chatbot />
    </div>
  );
}
