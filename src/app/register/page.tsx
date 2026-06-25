"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthNavbar, AuthFooter } from "@/components/AuthLayout";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";
import SubscriptionStep from "@/components/SubscriptionStep";

type Step = 1 | 2 | 3;

export default function RegisterPage() {
  const router = useRouter();
  const { lang } = useLang();
  const t = translations[lang];
  const dir = t.dir;

  const ROLES = [
    { id: "student",   icon: "🎓", label: t.segments[0].title, desc: t.segments[0].desc },
    { id: "professor", icon: "👨‍🏫", label: t.segments[1].title, desc: t.segments[1].desc },
    { id: "manager",   icon: "🏢", label: t.segments[2].title, desc: t.segments[2].desc },
    { id: "pr",        icon: "📣", label: t.segments[3].title, desc: t.segments[3].desc },
  ];

  const [step, setStep]               = useState<Step>(1);
  const [selectedRole, setSelectedRole] = useState("");
  const [form, setForm]               = useState({ name: "", email: "", password: "", orgName: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);
  const [success, setSuccess]         = useState(false);

  const update = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(f => ({ ...f, [k]: e.target.value }));

  const isStep1Valid = selectedRole !== "";
  const isStep2Valid = form.name.trim() !== "" && form.email.trim() !== "" && form.password.length >= 8;
  const strength      = form.password.length === 0 ? 0 : form.password.length < 6 ? 1 : form.password.length < 8 ? 2 : form.password.length < 12 ? 3 : 4;
  const strengthLabel = t.authPwdStrength;
  const strengthColor = ["", "#ef4444", "#f59e0b", "#22c778", "#2d8bba"];

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!isStep2Valid) return;
    setError("");
    setStep(3);
  }

  async function handleFinalSubmit(planId: string, isAnnual: boolean) {
    setError("");
    setLoading(true);
    try {
      const res  = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, orgName: form.orgName || selectedRole, planId, isAnnual }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || "حدث خطأ أثناء التسجيل."); setLoading(false); return; }
      setSuccess(true);
      setTimeout(() => router.push("/dashboard"), 1500);
    } catch {
      setError("خطأ في الشبكة. يرجى التحقق من اتصالك بالإنترنت.");
      setLoading(false);
    }
  }

  return (
    <div dir={dir} style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      {/* Shared Navbar */}
      <AuthNavbar />

      {/* Background orbs */}
      <div style={{ position: "fixed", top: "-10%", right: "-5%", width: 600, height: 600, borderRadius: "50%", background: "radial-gradient(circle, rgba(34,199,120,0.07) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />
      <div style={{ position: "fixed", bottom: "-10%", left: "-5%", width: 500, height: 500, borderRadius: "50%", background: "radial-gradient(circle, rgba(45,139,186,0.08) 0%, transparent 70%)", pointerEvents: "none", zIndex: 0 }} />

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
        <div style={{ width: "100%", maxWidth: step === 3 ? 1000 : 560, transition: "max-width 0.4s ease-in-out" }}>

          {/* Title */}
          <div style={{ textAlign: "center", marginBottom: 36 }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(34,199,120,0.08)",
              border: "1px solid rgba(34,199,120,0.25)",
              borderRadius: 100, padding: "5px 16px", marginBottom: 20,
            }}>
              <span style={{ fontSize: 12, color: "#22c778", fontWeight: 600 }}>✦ {t.authRegisterBadge}</span>
            </div>
            <h1 style={{ fontSize: 32, fontWeight: 900, margin: "0 0 10px", letterSpacing: "-0.02em", color: "var(--text-primary)" }}>
              {step === 1 ? t.authRegisterTitle : t.authRegisterTitle2}
            </h1>
            <p style={{ fontSize: 15, color: "var(--text-secondary)", margin: 0 }}>
              {step === 1 ? t.authRegisterSubtitle : t.authRegisterSubtitle2}
            </p>
          </div>

          {/* Progress bar */}
          <div style={{ display: "flex", gap: 8, marginBottom: 28 }}>
            {[1, 2, 3].map(s => (
              <div key={s} style={{
                flex: 1, height: 4, borderRadius: 100,
                background: s <= step ? "linear-gradient(90deg, #2d8bba, #22c778)" : "rgba(255,255,255,0.08)",
                transition: "background 0.4s ease",
              }} />
            ))}
          </div>

          {/* Card */}
          <div className="glass" style={{ padding: 36, borderRadius: 20, boxShadow: "0 24px 80px rgba(0,0,0,0.4)" }}>

            {/* SUCCESS */}
            {success && (
              <div style={{ textAlign: "center", padding: "20px 0" }}>
                <div style={{ fontSize: 64, marginBottom: 16 }}>✅</div>
                <h2 style={{ fontSize: 24, fontWeight: 800, marginBottom: 8 }}>{t.authSuccessTitle}</h2>
                <p style={{ color: "var(--text-secondary)", fontSize: 15 }}>{t.authSuccessSub}</p>
              </div>
            )}

            {/* STEP 1 */}
            {!success && step === 1 && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 28 }}>
                  {ROLES.map(role => (
                    <button
                      key={role.id}
                      onClick={() => setSelectedRole(role.id)}
                      style={{
                        position: "relative",
                        background: selectedRole === role.id ? "rgba(45,139,186,0.15)" : "rgba(255,255,255,0.03)",
                        border: `2px solid ${selectedRole === role.id ? "rgba(45,139,186,0.6)" : "rgba(255,255,255,0.08)"}`,
                        borderRadius: 16, padding: "20px 16px",
                        cursor: "pointer", textAlign: dir === "rtl" ? "right" : "left",
                        transition: "all 0.2s ease",
                        color: "inherit",
                        transform: selectedRole === role.id ? "scale(1.02)" : "scale(1)",
                      }}
                    >
                      <div style={{ fontSize: 28, marginBottom: 10 }}>{role.icon}</div>
                      <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 4, color: selectedRole === role.id ? "#4dbde8" : "var(--text-primary)" }}>
                        {role.label}
                      </div>
                      <div style={{ fontSize: 12, color: "var(--text-muted)", lineHeight: 1.4 }}>{role.desc}</div>
                      {selectedRole === role.id && (
                        <span style={{ position: "absolute", top: 10, [dir==="rtl"?"left":"right"]: 12, fontSize: 16, color: "#22c778" }}>✓</span>
                      )}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => isStep1Valid && setStep(2)}
                  disabled={!isStep1Valid}
                  className={isStep1Valid ? "btn-primary" : ""}
                  style={{
                    width: "100%", padding: "14px 20px", borderRadius: 12, border: "none",
                    background: isStep1Valid ? "linear-gradient(135deg, #2d8bba, #22c778)" : "rgba(255,255,255,0.05)",
                    color: isStep1Valid ? "#fff" : "var(--text-muted)",
                    fontSize: 16, fontWeight: 700, cursor: isStep1Valid ? "pointer" : "not-allowed",
                    transition: "all 0.3s ease",
                    boxShadow: isStep1Valid ? "0 8px 30px rgba(34,199,120,0.3)" : "none",
                  }}
                >
                  {t.authBtnContinue} {dir==="rtl"?"←":"→"}
                </button>
              </div>
            )}

            {/* STEP 2 */}
            {!success && step === 2 && (
              <form onSubmit={handleSubmit}>
                {/* Role badge */}
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 24, padding: "10px 14px", background: "rgba(45,139,186,0.08)", border: "1px solid rgba(45,139,186,0.2)", borderRadius: 10 }}>
                  <span style={{ fontSize: 20 }}>{ROLES.find(r => r.id === selectedRole)?.icon}</span>
                  <span style={{ fontSize: 14, color: "#4dbde8", fontWeight: 600 }}>{ROLES.find(r => r.id === selectedRole)?.label}</span>
                  <button type="button" onClick={() => setStep(1)} style={{ marginInlineStart: "auto", background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer", fontSize: 13 }}>
                    {t.authBtnChange}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div style={{ background: "var(--negative-bg)", border: "1px solid rgba(239,68,68,0.3)", borderRadius: 10, padding: "12px 16px", fontSize: 13, color: "#f87171", marginBottom: 20, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span>⚠️</span><span>{error}</span>
                  </div>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
                  {/* Name */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.authFullName}</label>
                    <input type="text" placeholder={t.authFullNamePh} value={form.name} onChange={update("name")} required autoComplete="name" className="input-field" style={{ fontSize: 15, padding: "12px 16px" }} />
                  </div>

                  {/* Email */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.authEmail}</label>
                    <input type="email" placeholder={t.authEmailPh} value={form.email} onChange={update("email")} required autoComplete="email" className="input-field" style={{ fontSize: 15, padding: "12px 16px" }} />
                  </div>

                  {/* Organisation */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                      {t.authOrg} <span style={{ color: "var(--text-muted)", fontWeight: 400, textTransform: "none" }}>{t.authOptional}</span>
                    </label>
                    <input type="text" placeholder={t.authOrgPh} value={form.orgName} onChange={update("orgName")} autoComplete="organization" className="input-field" style={{ fontSize: 15, padding: "12px 16px" }} />
                  </div>

                  {/* Password */}
                  <div>
                    <label style={{ display: "block", fontSize: 12, fontWeight: 600, marginBottom: 8, color: "var(--text-secondary)", textTransform: "uppercase", letterSpacing: "0.05em" }}>{t.authPassword} *</label>
                    <div style={{ position: "relative" }}>
                      <input
                        type={showPassword ? "text" : "password"}
                        placeholder={t.authPasswordLen}
                        value={form.password}
                        onChange={update("password")}
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="input-field"
                        style={{ fontSize: 15, padding: "12px 48px 12px 16px" }}
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ position: "absolute", [dir==="rtl"?"left":"right"]: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 18, color: "var(--text-muted)" }}>
                        {showPassword ? "🙈" : "👁️"}
                      </button>
                    </div>
                    {form.password.length > 0 && (
                      <div style={{ marginTop: 10 }}>
                        <div style={{ display: "flex", gap: 4, marginBottom: 6 }}>
                          {[1, 2, 3, 4].map(i => (
                            <div key={i} style={{ flex: 1, height: 4, borderRadius: 100, background: i <= strength ? strengthColor[strength] : "rgba(255,255,255,0.08)", transition: "background 0.3s" }} />
                          ))}
                        </div>
                        <span style={{ fontSize: 12, color: strengthColor[strength], fontWeight: 600 }}>{strengthLabel[strength]}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Terms */}
                <p style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 20, lineHeight: 1.6 }}>
                  {t.authTerms1}{" "}
                  <span style={{ color: "#4dbde8", cursor: "pointer" }}>{t.authTerms2}</span>{" "}
                  {t.authTerms3}{" "}
                  <span style={{ color: "#4dbde8", cursor: "pointer" }}>{t.authTerms4}</span>.
                </p>

                {/* Buttons */}
                <div style={{ display: "flex", gap: 10, marginTop: 24 }}>
                  <button type="button" onClick={() => setStep(1)} style={{ padding: "14px 20px", borderRadius: 12, border: "1px solid var(--border)", background: "transparent", color: "var(--text-secondary)", fontSize: 14, cursor: "pointer", fontWeight: 500 }}>
                    {dir==="rtl"?"→":"←"} {t.authBtnBack}
                  </button>
                  <button
                    type="submit"
                    disabled={!isStep2Valid}
                    style={{
                      flex: 1, padding: "14px 20px", borderRadius: 12, border: "none",
                      background: !isStep2Valid ? "rgba(255,255,255,0.05)" : "linear-gradient(135deg, #2d8bba, #22c778)",
                      color: !isStep2Valid ? "var(--text-muted)" : "#fff",
                      fontSize: 16, fontWeight: 700,
                      cursor: !isStep2Valid ? "not-allowed" : "pointer",
                      transition: "all 0.3s ease",
                      boxShadow: isStep2Valid ? "0 8px 30px rgba(34,199,120,0.3)" : "none",
                      display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
                    }}
                  >
                    {t.authBtnContinue} {dir==="rtl"?"←":"→"}
                  </button>
                </div>
              </form>
            )}

            {/* STEP 3 - Subscription */}
            {!success && step === 3 && (
              <div style={{ position: "relative" }}>
                {loading && (
                  <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.7)", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 20, backdropFilter: "blur(4px)" }}>
                    <span style={{ width: 44, height: 44, border: "4px solid rgba(34,199,120,0.2)", borderTop: "4px solid #22c778", borderRadius: "50%", display: "inline-block", animation: "spin 0.8s linear infinite" }} />
                  </div>
                )}
                <SubscriptionStep
                  selectedRoleId={selectedRole}
                  selectedRoleLabel={ROLES.find(r => r.id === selectedRole)?.label || ""}
                  selectedRoleIcon={ROLES.find(r => r.id === selectedRole)?.icon || ""}
                  onBack={() => setStep(2)}
                  onContinue={handleFinalSubmit}
                />
              </div>
            )}
          </div>

          {/* Sign in link */}
          {!success && (
            <p style={{ textAlign: "center", marginTop: 24, fontSize: 14, color: "var(--text-muted)" }}>
              {t.authHasAccount}{" "}
              <Link href="/login" style={{ color: "#4dbde8", textDecoration: "none", fontWeight: 600 }}>
                {t.authNavLogin}
              </Link>
            </p>
          )}
        </div>
      </main>

      {/* Shared Footer */}
      <AuthFooter />

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
        @media (max-width: 480px) {
          div[style*="grid-template-columns: 1fr 1fr"] {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
