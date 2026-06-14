"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthNavbar, AuthFooter } from "@/components/AuthLayout";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

export default function LoginPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];
  const dir = t.dir;

  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPwd, setShowPwd]   = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "فشل تسجيل الدخول."); return; }
      router.push("/dashboard");
      router.refresh();
    } catch {
      setError("خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div dir={dir} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Shared Navbar */}
      <AuthNavbar />

      {/* Background orbs */}
      <div style={{ position: "fixed", top: "20%", left: "10%", width: 400, height: 400, background: "radial-gradient(circle, rgba(45,139,186,0.09) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "20%", right: "10%", width: 300, height: 300, background: "radial-gradient(circle, rgba(34,199,120,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

      {/* Main */}
      <main style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "100px 24px 60px",
        position: "relative",
        zIndex: 1,
      }}>
        <div style={{ width: "100%", maxWidth: 440 }}>

          {/* Header text */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(45,139,186,0.08)",
              border: "1px solid rgba(45,139,186,0.22)",
              borderRadius: 100, padding: "5px 16px", marginBottom: 18,
            }}>
              <span style={{ fontSize: 12, color: "#4dbde8", fontWeight: 600 }}>⚡ {t.authLoginBadge}</span>
            </div>
            <h1 style={{ fontSize: 30, fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              {t.authLoginTitle}
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: 0 }}>
              {t.authLoginSubtitle}
            </p>
          </div>

          {/* Card */}
          <div className="glass" style={{ padding: 36, borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.35)" }}>

            {/* Error */}
            {error && (
              <div style={{
                background: "var(--negative-bg)", border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: 10, padding: "12px 16px", fontSize: 13,
                color: "#f87171", marginBottom: 22, display: "flex", gap: 8, alignItems: "flex-start",
              }}>
                <span>⚠️</span><span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              {/* Email */}
              <div style={{ marginBottom: 18 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t.authEmail}
                </label>
                <input
                  id="email"
                  type="email"
                  className="input-field"
                  placeholder={t.authEmailPh}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  style={{ fontSize: 15, padding: "12px 16px" }}
                />
              </div>

              {/* Password */}
              <div style={{ marginBottom: 26 }}>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                  {t.authPassword}
                </label>
                <div style={{ position: "relative" }}>
                  <input
                    id="password"
                    type={showPwd ? "text" : "password"}
                    className="input-field"
                    placeholder={t.authPasswordPh}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                    style={{ fontSize: 15, padding: "12px 48px 12px 16px" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPwd(!showPwd)}
                    style={{ position: "absolute", [dir==="rtl"?"left":"right"]: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}
                  >
                    {showPwd ? "🙈" : "👁️"}
                  </button>
                </div>
              </div>

              <button
                id="login-btn"
                type="submit"
                className="btn-primary"
                style={{ width: "100%", padding: "14px 20px", fontSize: 16, borderRadius: 12 }}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span style={{ width: 18, height: 18, border: "2px solid rgba(255,255,255,0.3)", borderTop: "2px solid #fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                    {t.authBtnLoading}
                  </>
                ) : t.authBtnLogin}
              </button>
            </form>

            {/* Divider */}
            <div style={{ borderTop: "1px solid var(--border)", marginTop: 24, paddingTop: 20, textAlign: "center" }}>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>
                {t.authNoAccount}{" "}
                <Link href="/register" style={{ color: "#4dbde8", textDecoration: "none", fontWeight: 600 }}>
                  {t.authNavRegister}
                </Link>
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Shared Footer */}
      <AuthFooter />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
