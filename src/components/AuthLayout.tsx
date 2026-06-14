"use client";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LangContext";
import { translations, Lang } from "@/lib/translations";
import { useTheme } from "@/context/ThemeContext";

const LANGS: Lang[] = ["AR", "FR", "EN"];
const FLAG: Record<Lang, string> = { AR: "🇸🇦", FR: "🇫🇷", EN: "🇺🇸" };

/* ─── Navbar ─────────────────────────────────────────────────────────── */
export function AuthNavbar() {
  const pathname = usePathname();
  const isLogin    = pathname === "/login";
  const isRegister = pathname === "/register";

  const { lang, setLang } = useLang();
  const t = translations[lang];
  const [langOpen, setLangOpen] = useState(false);

  // Use the same styling variables as the welcome page
  const { theme } = useTheme();
  const dark = theme === "dark"; 
  const text = dark ? "#ddeee8" : "#12271e";
  const border = dark ? "#1d2f3a" : "#ccdfd7";
  const navBg = dark ? "rgba(11,16,21,0.95)" : "rgba(240,247,244,0.95)";
  const cardBg = dark ? "#131f28" : "#ffffff";
  const dir = t.dir;

  return (
    <nav dir={dir} style={{ position: "fixed", top: 0, left: 0, right: 0, zIndex: 1000,
      background: navBg, backdropFilter: "blur(16px)", borderBottom: `1px solid ${border}` }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "0 24px", height: 68,
        display: "flex", alignItems: "center", gap: 0 }}>

        {/* Logo */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", flex: "none" }}>
          <Link href="/welcome" style={{ display: "flex", alignItems: "center", textDecoration: "none" }}>
            <div style={{
              position: "relative", width: 64, height: 64,
              flexShrink: 0,
            }}>
              <Image src="/logo.png" alt="NARP-SMART Logo" fill style={{ objectFit: "contain" }} priority sizes="64px" />
            </div>
          </Link>
        </div>

        {/* Right actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, justifyContent: "flex-end" }}>
          
          {/* Language switcher */}
          <div style={{ position: "relative" }}>
            <button onClick={() => setLangOpen(!langOpen)}
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

          <Link href="/welcome" style={{ padding: "8px 16px", borderRadius: 8,
            border: `1px solid ${border}`, color: text, textDecoration: "none",
            fontSize: 14, fontWeight: 500, display: "flex", alignItems: "center", gap: 6, transition: "background 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <span style={{ fontSize: 16 }}>🏠</span> {t.authNavHome}
          </Link>
          
          {isLogin && (
            <Link href="/register" style={{ padding: "8px 16px", borderRadius: 8,
              background: "linear-gradient(135deg,#2d8bba,#22c778)", color: "#fff",
              textDecoration: "none", fontSize: 14, fontWeight: 600,
              boxShadow: "0 4px 15px rgba(34,199,120,0.3)" }}>
              {t.authNavRegister}
            </Link>
          )}
          {isRegister && (
            <Link href="/login" style={{ padding: "8px 16px", borderRadius: 8,
              border: `1px solid ${border}`, color: text, textDecoration: "none",
              fontSize: 14, fontWeight: 500, transition: "background 0.2s" }}
              onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
              onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
              {t.authNavLogin}
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}

/* ─── Footer ─────────────────────────────────────────────────────────── */
export function AuthFooter() {
  const { lang } = useLang();
  const t = translations[lang];

  const { theme } = useTheme();
  const dark = theme === "dark";
  const muted = dark ? "#8faaa0" : "#3d5f52";
  const border = dark ? "#1d2f3a" : "#ccdfd7";
  const dir = t.dir;

  return (
    <footer dir={dir} style={{ borderTop: `1px solid ${border}`, padding: "32px 24px",
      textAlign: "center", position: "relative", zIndex: 10, 
      background: dark ? "rgba(11,16,21,0.95)" : "rgba(240,247,244,0.95)", backdropFilter: "blur(10px)" }}>
      <div style={{ maxWidth: 1280, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center",
          gap: 10, marginBottom: 12 }}>
          <div style={{ position: "relative", width: 80, height: 80,
            flexShrink: 0,
          }}>
            <Image src="/logo.png" alt="NARP-SMART" fill style={{ objectFit: "contain" }} sizes="80px" />
          </div>
        </div>
        <p style={{ color: muted, fontSize: 13 }}>{t.footerDesc}</p>
        <p style={{ color: muted, fontSize: 12, marginTop: 16 }}>{t.footerRights}</p>
      </div>
    </footer>
  );
}
