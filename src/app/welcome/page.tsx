"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import PRBackground from "@/components/PRBackground";
import Chatbot from "@/components/Chatbot";
import { translations, Lang } from "@/lib/translations";
import { useLang } from "@/context/LangContext";

const LANGS: Lang[] = ["AR", "FR", "EN"];
const FLAG: Record<Lang, string> = { AR: "🇸🇦", FR: "🇫🇷", EN: "🇺🇸" };

// Map nav index → section ID
const NAV_IDS = ["home", "services", "about", "contact"];

// Icons for each nav item
const NAV_ICONS: Record<string, string> = {
  home: "🏠", services: "⚙️", about: "💡", contact: "📬", segments: "🎯",
};

export default function LandingPage() {
  const { lang, setLang } = useLang();
  const [dark, setDark]         = useState(false);
  const [segmentOpen, setSegmentOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Intersection observer — track active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.35, rootMargin: "-64px 0px 0px 0px" }
    );
    NAV_IDS.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  // Smooth scroll helper
  function scrollTo(id: string) {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const t   = translations[lang];
  const dir = t.dir;

  const bg      = dark ? "#0b1015" : "#f0f7f4";
  const cardBg  = dark ? "#131f28" : "#ffffff";
  const navBg   = dark ? "rgba(11,16,21,0.95)" : "rgba(240,247,244,0.95)";
  const text     = dark ? "#ddeee8" : "#12271e";
  const muted    = dark ? "#8faaa0" : "#3d5f52";
  const border   = dark ? "#1d2f3a" : "#ccdfd7";

  return (
    <div dir={dir} style={{ background: bg, color: text, minHeight: "100vh",
      fontFamily: "'Inter','Segoe UI',sans-serif", overflowX: "hidden", position: "relative" }}>

      <PRBackground dark={dark} />

      {/* ===== NAVBAR ===== */}
      <nav style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
        background: navBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${border}` }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 68,
          display: "flex", alignItems: "center", gap: 0 }}>

          {/* Nav links */}
          <div className="nav-links-desktop" style={{ display: "flex", alignItems: "center", gap: 4, flex: 1 }}>
            {t.nav.map((l, i) => {
              const id = NAV_IDS[i];
              const isActive = activeSection === id;
              return (
                <button key={l}
                  onClick={() => scrollTo(id)}
                  style={{ background: isActive ? "rgba(45,139,186,0.12)" : "none",
                    border: isActive ? "1px solid rgba(45,139,186,0.3)" : "1px solid transparent",
                    cursor: "pointer",
                    color: isActive ? "#4dbde8" : muted,
                    fontSize: 14, fontWeight: isActive ? 700 : 500,
                    padding: "7px 12px", borderRadius: 8,
                    display: "flex", alignItems: "center", gap: 5,
                    transition: "all 0.2s" }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.color = text; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.color = muted; }}>
                  <span style={{ fontSize: 13 }}>{NAV_ICONS[id]}</span>
                  {l}
                  {isActive && <span style={{ width: 5, height: 5, borderRadius: "50%",
                    background: "#4dbde8", display: "inline-block", marginInlineStart: 2 }} />}
                </button>
              );
            })}

          </div>
          <div className="mobile-menu-btn" style={{ flex: 1, display: "none" }}>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} style={{ background: "none", border: "none", color: text, fontSize: 28, cursor: "pointer", display: "flex", alignItems: "center" }}>
              {mobileMenuOpen ? "✕" : "☰"}
            </button>
          </div>

          {/* Logo */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
            <Link href="/" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
              <div style={{
                position: "relative", width: 64, height: 64,
                flexShrink: 0,
              }}>
                <Image src="/logo.png" alt="NARP-SMART Logo" fill style={{ objectFit: "contain" }} priority />
              </div>
            </Link>
          </div>

          {/* Right actions */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, justifyContent: "flex-end" }}>

            {/* Language switcher */}
            <div style={{ position: "relative" }}>
              <button onClick={() => { setLangOpen(!langOpen); setSegmentOpen(false); }}
                style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 12px",
                  borderRadius: 8, background: "transparent", border: `1px solid ${border}`,
                  color: text, fontSize: 13, fontWeight: 700, cursor: "pointer" }}>
                {FLAG[lang]} {lang} <span style={{ fontSize: 9, opacity: 0.5 }}>▼</span>
              </button>
              {langOpen && (
                <div style={{ position: "absolute", top: "calc(100% + 8px)",
                  [dir==="rtl"?"left":"right"]: 0,
                  background: cardBg, border: `1px solid ${border}`, borderRadius: 12,
                  padding: 6, minWidth: 140, boxShadow: "0 12px 40px rgba(0,0,0,0.3)", zIndex: 200 }}>
                  {LANGS.map(l => (
                    <button key={l} onClick={() => { setLang(l); setLangOpen(false); }}
                      style={{ display: "flex", alignItems: "center", gap: 8, width: "100%",
                        padding: "9px 12px", borderRadius: 8, fontSize: 13, border: "none",
                        background: lang === l ? "rgba(45,139,186,0.15)" : "transparent",
                        color: lang === l ? "#4dbde8" : text, cursor: "pointer",
                        fontWeight: lang === l ? 700 : 400 }}>
                      {FLAG[l]} {l === "AR" ? "العربية" : l === "FR" ? "Français" : "English"}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Theme toggle */}
            <button onClick={() => setDark(!dark)}
              style={{ background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
                border: `1px solid ${border}`, borderRadius: 8, padding: "7px 12px",
                cursor: "pointer", fontSize: 16, color: text }}>
              {dark ? "☀️" : "🌙"}
            </button>

            <Link href="/login" style={{ padding: "8px 16px", borderRadius: 8,
              border: `1px solid ${border}`, color: text, textDecoration: "none",
              fontSize: 14, fontWeight: 500 }}>
              {t.login}
            </Link>
            <Link href="/register" style={{ padding: "8px 16px", borderRadius: 8,
              background: "linear-gradient(135deg,#2d8bba,#22c778)", color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
              boxShadow: "0 4px 15px rgba(34,199,120,0.3)" }}>
              {t.register}
            </Link>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div style={{ position: "fixed", top: 68, left: 0, right: 0, bottom: 0, background: navBg, backdropFilter: "blur(20px)", zIndex: 999, padding: "32px 24px", display: "flex", flexDirection: "column", gap: 12, overflowY: "auto", borderTop: `1px solid ${border}` }}>
          {t.nav.map((l, i) => {
            const id = NAV_IDS[i];
            const isActive = activeSection === id;
            return (
              <button key={l}
                onClick={() => { scrollTo(id); setMobileMenuOpen(false); }}
                style={{ background: isActive ? "rgba(45,139,186,0.12)" : "rgba(255,255,255,0.03)",
                  border: isActive ? "1px solid rgba(45,139,186,0.3)" : `1px solid ${border}`,
                  color: isActive ? "#4dbde8" : text,
                  fontSize: 16, fontWeight: isActive ? 700 : 500,
                  padding: "16px 20px", borderRadius: 12,
                  display: "flex", alignItems: "center", gap: 12,
                  width: "100%", cursor: "pointer",
                  transition: "all 0.2s" }}
              >
                <span style={{ fontSize: 20 }}>{NAV_ICONS[id]}</span> 
                <span style={{ marginInlineEnd: "auto" }}>{l}</span>
              </button>
            );
          })}
        </div>
      )}

      {/* ===== HERO ===== */}
      <section id="home" style={{ minHeight: "100vh", display: "flex", alignItems: "center",
        padding: "100px 24px 60px", maxWidth: 1280, margin: "0 auto",
        position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", width: "100%", maxWidth: 800, margin: "0 auto" }}>

          {/* Text */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8,
              background: dark ? "rgba(34,199,120,0.1)" : "rgba(34,199,120,0.08)",
              border: "1px solid rgba(34,199,120,0.3)", borderRadius: 100,
              padding: "5px 14px", marginBottom: 20 }}>
              <span style={{ fontSize: 12 }}>🤖</span>
              <span style={{ fontSize: 12, color: "#22c778", fontWeight: 600 }}>{t.heroBadge}</span>
            </div>
            <h1 style={{ fontSize: 52, fontWeight: 900, lineHeight: 1.15,
              marginBottom: 20, letterSpacing: "-0.02em" }}>
              {t.heroTitle1}{" "}
              <span style={{ background: "linear-gradient(135deg,#2d8bba,#22c778)",
                WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
                {t.heroTitle2}
              </span>
            </h1>
            <p style={{ fontSize: 17, color: muted, lineHeight: 1.8, marginBottom: 36, maxWidth: 500 }}>
              {t.heroDesc}
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", justifyContent: "center" }}>
              <Link href="/register" style={{ padding: "14px 28px", borderRadius: 12,
                background: "linear-gradient(135deg,#2d8bba,#22c778)", color: "#fff",
                textDecoration: "none", fontSize: 16, fontWeight: 700,
                boxShadow: "0 8px 30px rgba(34,199,120,0.3)",
                display: "flex", alignItems: "center", gap: 8 }}>
                {t.heroBtn1}
              </Link>
              <Link href="#services" style={{ padding: "14px 28px", borderRadius: 12,
                border: `2px solid ${border}`, color: text, textDecoration: "none",
                fontSize: 16, fontWeight: 600, background: "transparent" }}>
                {t.heroBtn2}
              </Link>
            </div>
            <div style={{ display: "flex", gap: 24, marginTop: 32, justifyContent: "center" }}>
              {t.heroFeatures.map(([ic, lb]) => (
                <div key={lb} style={{ display: "flex", alignItems: "center", gap: 6,
                  color: muted, fontSize: 13 }}>
                  <span>{ic}</span><span>{lb}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ===== SEGMENTS ===== */}
      <section style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div style={{ textAlign: "center", marginBottom: 48 }}>
          <p style={{ color: "#22c778", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
            textTransform: "uppercase", marginBottom: 12 }}>{t.segSubtitle}</p>
          <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>{t.segTitle}</h2>
          <p style={{ color: muted, fontSize: 16 }}>{t.segDesc}</p>
        </div>
        <div className="responsive-grid-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 20 }}>
          {t.segments.map(s => (
            <div key={s.title} style={{ background: cardBg, border: `1px solid ${border}`,
              borderRadius: 18, padding: 24, textAlign: "center", transition: "all 0.25s", cursor: "pointer" }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = s.color; el.style.transform = "translateY(-6px)"; el.style.boxShadow = `0 20px 40px ${s.color}25`; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = border; el.style.transform = "translateY(0)"; el.style.boxShadow = "none"; }}>
              <div style={{ width: 56, height: 56, borderRadius: 14, background: `${s.color}18`,
                border: `2px solid ${s.color}40`, display: "flex", alignItems: "center",
                justifyContent: "center", fontSize: 26, margin: "0 auto 16px" }}>{s.icon}</div>
              <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
              <p style={{ color: muted, fontSize: 13, lineHeight: 1.7, marginBottom: 16 }}>{s.desc}</p>
              <Link href="/login" style={{ color: s.color, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
                {s.cta} {dir === "rtl" ? "←" : "→"}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* ===== ABOUT ===== */}
      <section id="about" style={{ padding: "80px 24px", maxWidth: 1280, margin: "0 auto", position: "relative", zIndex: 1 }}>
        <div className="responsive-grid-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }}>
          <div>
            <p style={{ color: "#22c778", fontSize: 13, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase", marginBottom: 16 }}>— {lang === "AR" ? "عن المنصة" : lang === "FR" ? "À propos" : "About"} —</p>
            <h2 style={{ fontSize: 38, fontWeight: 900, marginBottom: 20, lineHeight: 1.2 }}>
              {lang === "AR" ? <>منصة ذكية لـ <span style={{ background: "linear-gradient(135deg,#2d8bba,#22c778)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>هندسة العلاقات العامة</span></>
              : lang === "FR" ? <>Une plateforme intelligente pour <span style={{ background: "linear-gradient(135deg,#2d8bba,#22c778)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>les Relations Publiques</span></>
              : <>Smart platform for <span style={{ background: "linear-gradient(135deg,#2d8bba,#22c778)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>PR Engineering</span></>}
            </h2>
            <p style={{ color: muted, fontSize: 16, lineHeight: 1.85, marginBottom: 32 }}>
              {lang === "AR"
                ? "NARP-SMART منصة رقمية متخصصة تجمع بين تقنيات الذكاء الاصطناعي وتحليل البيانات الضخمة لخدمة متخصصي العلاقات العامة والاتصال المؤسسي. تُمكّن المؤسسات من رصد سمعتها، وتحليل تفاعل جمهورها، والتنبؤ بالأزمات الاتصالية قبل وقوعها."
                : lang === "FR"
                ? "NARP-SMART est une plateforme numérique spécialisée combinant l'intelligence artificielle et l'analyse de données massives au service des professionnels des relations publiques. Elle permet aux institutions de surveiller leur réputation, analyser l'engagement de leur audience et anticiper les crises."
                : "NARP-SMART is a specialized digital platform combining AI and big data analytics to serve public relations and institutional communication professionals. It enables organizations to monitor their reputation, analyze audience engagement, and predict communication crises before they occur."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {(lang === "AR"
                ? [["🤖","ذكاء اصطناعي متقدم لتحليل البيانات"],["⚡","إنذار مبكر للأزمات الاتصالية"],["🔒","أمان وسرية تامة للبيانات"],["📊","تقارير تحليلية تفاعلية في الوقت الحقيقي"]]
                : lang === "FR"
                ? [["🤖","IA avancée pour l'analyse des données"],["⚡","Alerte précoce des crises de communication"],["🔒","Sécurité et confidentialité totales"],["📊","Rapports analytiques interactifs en temps réel"]]
                : [["🤖","Advanced AI for data analysis"],["⚡","Early warning for communication crises"],["🔒","Full data security and privacy"],["📊","Real-time interactive analytics reports"]]
              ).map(([icon, label]) => (
                <div key={label} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                    background: "rgba(45,139,186,0.12)", border: "1px solid rgba(45,139,186,0.25)",
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: 17 }}>{icon}</div>
                  <span style={{ color: muted, fontSize: 14 }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Visual side */}
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {[["🎯","#2d8bba",lang==="AR"?"دقة التحليل":lang==="FR"?"Précision":"Precision","97%"],["⚡","#22c778",lang==="AR"?"سرعة المعالجة":lang==="FR"?"Rapidité":"Speed","2x"],["🌐","#6b9e90",lang==="AR"?"تغطية رصد شاملة":lang==="FR"?"Couverture globale":"Global Coverage","100%"],["🔔","#f59e0b",lang==="AR"?"الإنذار المبكر":lang==="FR"?"Alerte précoce":"Early Alert","24/7"]].map(([icon,color,label,val]) => (
              <div key={label} style={{ background: cardBg, border: `1px solid ${border}`,
                borderRadius: 14, padding: "16px 20px", display: "flex", alignItems: "center", gap: 16,
                transition: "transform 0.2s" }}
                onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.transform="translateX(8px)"}
                onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.transform="translateX(0)"}>
                <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${color}18`, border: `2px solid ${color}40`,
                  display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>{icon}</div>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: 13, color: muted, marginBottom: 4 }}>{label}</p>
                  <div style={{ height: 6, background: "rgba(255,255,255,0.08)", borderRadius: 99 }}>
                    <div style={{ height: "100%", width: val.includes("%") ? val : "85%",
                      background: `linear-gradient(90deg,${color},${color}99)`, borderRadius: 99 }} />
                  </div>
                </div>
                <span style={{ fontSize: 16, fontWeight: 800, color }}>{val}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== SERVICES ===== */}
      <section id="services" style={{ padding: "80px 24px", position: "relative", zIndex: 1,
        background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 48 }}>
            <p style={{ color: "#2d8bba", fontSize: 13, fontWeight: 700,
              letterSpacing: "0.1em", marginBottom: 12 }}>{t.srvSubtitle}</p>
            <h2 style={{ fontSize: 36, fontWeight: 900, marginBottom: 12 }}>{t.srvTitle}</h2>
            <p style={{ color: muted, fontSize: 16 }}>{t.srvDesc}</p>
          </div>
          <div className="responsive-grid-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {t.services.map(s => (
              <div key={s.title} style={{ background: cardBg, border: `1px solid ${border}`,
                borderRadius: 18, padding: 28, transition: "all 0.25s", cursor: "pointer" }}
                onMouseEnter={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = "#2d8bba50"; el.style.transform = "translateY(-4px)"; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLDivElement; el.style.borderColor = border; el.style.transform = "translateY(0)"; }}>
                <div style={{ fontSize: 32, marginBottom: 14 }}>{s.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 800, marginBottom: 8 }}>{s.title}</h3>
                <p style={{ color: muted, fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>{s.desc}</p>
                <span style={{ color: "#2d8bba", fontSize: 13, fontWeight: 600 }}>{t.srvLearnMore}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===== FEATURE BAR ===== */}
      <section style={{ padding: "40px 24px", borderTop: `1px solid ${border}`,
        borderBottom: `1px solid ${border}`, position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "flex",
          justifyContent: "space-around", flexWrap: "wrap", gap: 24 }}>
          {t.features.map(([ic, lb]) => (
            <div key={lb} style={{ display: "flex", alignItems: "center", gap: 10,
              color: muted, fontSize: 14 }}>
              <span style={{ fontSize: 20 }}>{ic}</span><span>{lb}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ===== CTA ===== */}
      <section id="contact" style={{ padding: "100px 24px", textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 700, margin: "0 auto" }}>
          <h2 style={{ fontSize: 42, fontWeight: 900, marginBottom: 16 }}>
            {t.ctaTitle1}{" "}
            <span style={{ background: "linear-gradient(135deg,#2d8bba,#22c778)",
              WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
              {t.ctaTitle2}
            </span>
          </h2>
          <p style={{ color: muted, fontSize: 17, marginBottom: 36, lineHeight: 1.8 }}>{t.ctaDesc}</p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/register" style={{ padding: "16px 36px", borderRadius: 14,
              background: "linear-gradient(135deg,#2d8bba,#22c778)", color: "#fff",
              textDecoration: "none", fontSize: 17, fontWeight: 700,
              boxShadow: "0 12px 40px rgba(34,199,120,0.35)" }}>
              {t.ctaBtn1}
            </Link>
            <Link href="/login" style={{ padding: "16px 36px", borderRadius: 14,
              border: `2px solid ${border}`, color: text, textDecoration: "none",
              fontSize: 17, fontWeight: 600 }}>
              {t.ctaBtn2}
            </Link>
          </div>
        </div>
      </section>

      {/* ===== FOOTER ===== */}
      <footer style={{ borderTop: `1px solid ${border}`, padding: "32px 24px",
        textAlign: "center", position: "relative", zIndex: 1 }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
            gap: 10, marginBottom: 12 }}>
            <div style={{ position: "relative", width: 80, height: 80,
              flexShrink: 0,
            }}>
              <Image src="/logo.png" alt="NARP-SMART" fill style={{ objectFit: "contain" }} />
            </div>
          </div>
          <p style={{ color: muted, fontSize: 13 }}>{t.footerDesc}</p>
          <p style={{ color: muted, fontSize: 12, marginTop: 16 }}>{t.footerRights}</p>
        </div>
      </footer>

      {/* Floating Language FAB (mobile) & Responsive Styles */}
      <style>{`
        @media (max-width: 900px) {
          .nav-links-desktop { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
        }
        @media (max-width: 768px) {
          .lang-fab { display: flex !important; }
          .responsive-grid-2 { grid-template-columns: 1fr !important; gap: 40px !important; }
          .responsive-grid-3 { grid-template-columns: 1fr !important; gap: 24px !important; }
          .responsive-grid-4 { grid-template-columns: 1fr 1fr !important; gap: 16px !important; }
        }
        @media (max-width: 480px) {
          .responsive-grid-4 { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Chatbot />
    </div>
  );
}
