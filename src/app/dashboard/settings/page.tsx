"use client";
import { useEffect, useState } from "react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

interface User { id: string; name: string; email: string; role: string; orgName: string | null; createdAt: string; }

export default function SettingsPage() {
  const [user, setUser] = useState<User | null>(null);
  const { lang } = useLang();
  const t = translations[lang];

  useEffect(() => {
    fetch("/api/auth/me").then(r => r.json()).then(d => setUser(d.user));
  }, []);

  return (
    <div>
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t.settingsTitle}</h1>
        <p style={{ color: "var(--text-muted)", fontSize: 14 }}>{t.settingsSub}</p>
      </div>

      {/* Profile Card */}
      <div className="glass" style={{ padding: 32, marginBottom: 24, maxWidth: 600 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 24 }}>{t.profileTitle}</h2>
        {user ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(135deg,#2d8bba,#22c778)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 26, fontWeight: 700, color: "#fff", flexShrink: 0 }}>
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <p style={{ fontSize: 18, fontWeight: 700, marginBottom: 2 }}>{user.name}</p>
                <p style={{ fontSize: 13, color: "var(--text-muted)" }}>{user.email}</p>
                <span className="badge" style={{ marginTop: 6, background: "rgba(45,139,186,0.15)", color: "#4dbde8", border: "1px solid rgba(45,139,186,0.3)" }}>{user.role}</span>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              {[
                { label: t.lblOrg, value: user.orgName || t.notSpecified },
                { label: t.lblMemberSince, value: new Date(user.createdAt).toLocaleDateString() },
                { label: t.lblRole, value: user.role },
                { label: t.lblUserId, value: user.id.slice(0, 12) + "..." },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{label}</p>
                  <p style={{ fontSize: 14, color: "var(--text-primary)" }}>{value}</p>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[...Array(4)].map((_, i) => <div key={i} className="skeleton" style={{ height: 20, borderRadius: 6 }} />)}
          </div>
        )}
      </div>

    </div>
  );
}
