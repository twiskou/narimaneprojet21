"use client";
import { useEffect, useState, useCallback } from "react";
import { useLang } from "@/context/LangContext";
import { translations } from "@/lib/translations";

interface Alert { 
  id: string; 
  type: string; 
  message: string; 
  severity: string;
  isRead: boolean; 
  triggeredAt: string; 
}

const ICON: Record<string, string> = { NEGATIVE_SPIKE: "🔴", VOLUME_SURGE: "🟠", REPUTATION_DROP: "🟡" };
const COLOR: Record<string, string> = { NEGATIVE_SPIKE: "#ef4444", VOLUME_SURGE: "#f59e0b", REPUTATION_DROP: "#eab308" };
const SEVERITY_COLOR: Record<string, string> = { HIGH: "#ef4444", MEDIUM: "#f59e0b", LOW: "#22c55e" };

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filter, setFilter] = useState<"all" | "unread" | "read">("all");
  const [loading, setLoading] = useState(true);
  const { lang } = useLang();
  const t = translations[lang];

  const load = useCallback(async () => {
    setLoading(true);
    const params = filter === "unread" ? "?isRead=false" : filter === "read" ? "?isRead=true" : "";
    const res = await fetch(`/api/alerts${params}`);
    const data = await res.json();
    setAlerts(data.alerts || []);
    setLoading(false);
  }, [filter]);

  useEffect(() => { load(); }, [load]);

  async function markRead(id: string) {
    await fetch(`/api/alerts/${id}`, { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true })
    });
    await load();
  }

  async function deleteAlert(id: string) {
    await fetch(`/api/alerts/${id}`, { method: "DELETE" });
    await load();
  }

  async function markAllRead() {
    const unread = alerts.filter(a => !a.isRead);
    await Promise.all(unread.map(a => fetch(`/api/alerts/${a.id}`, { 
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isRead: true })
    })));
    await load();
  }

  const unreadCount = alerts.filter(a => !a.isRead).length;

  return (
    <div>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 28, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 26, fontWeight: 800, marginBottom: 4 }}>{t.alertsTitle}</h1>
          <p style={{ color: "var(--text-muted)", fontSize: 14 }}>
            {unreadCount > 0 ? <span style={{ color: "#f87171" }}>{unreadCount} {t.alertsUnreadRequire}</span> : t.alertsAllReviewed}
          </p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {unreadCount > 0 && (
            <button onClick={markAllRead} className="btn-secondary" style={{ fontSize: 13 }}>✓ {t.btnMarkAllRead}</button>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 24, background: "var(--bg-card)", borderRadius: 12, padding: 4, border: "1px solid var(--border)", width: "fit-content" }}>
        {(["all", "unread", "read"] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            style={{ padding: "7px 18px", borderRadius: 9, fontSize: 13, fontWeight: 500, border: "none", cursor: "pointer", transition: "all 0.15s",
              background: filter === f ? "rgba(45,139,186,0.2)" : "transparent",
              color: filter === f ? "#4dbde8" : "var(--text-muted)" }}>
            {f === "all" ? t.filterAll : f === "unread" ? t.filterUnread : t.filterRead}
          </button>
        ))}
      </div>

      {/* Alerts list */}
      {loading ? (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {[...Array(5)].map((_, i) => <div key={i} className="skeleton" style={{ height: 80, borderRadius: 12 }} />)}
        </div>
      ) : alerts.length === 0 ? (
        <div className="glass" style={{ textAlign: "center", padding: "64px 24px" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔕</div>
          <p style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>{t.noAlerts}</p>
          <p style={{ fontSize: 14, color: "var(--text-muted)" }}>{t.alertsSystemSmooth}</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {alerts.map((alert) => {
            const color = COLOR[alert.type] || "#2d8bba";
            const icon = ICON[alert.type] || "ℹ️";
            const severityColor = SEVERITY_COLOR[alert.severity || "MEDIUM"] || SEVERITY_COLOR.MEDIUM;

            return (
              <div key={alert.id} style={{
                display: "flex", alignItems: "flex-start", gap: 16, padding: "18px 20px",
                background: "var(--bg-card)", borderRadius: 14,
                border: `1px solid ${alert.isRead ? "var(--border)" : `${color}30`}`,
                opacity: alert.isRead ? 0.7 : 1,
                transition: "all 0.2s",
              }}>
                <div style={{ width: 42, height: 42, borderRadius: 11, background: `${color}15`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
                  {icon}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 6 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color, textTransform: "uppercase", letterSpacing: "0.06em" }}>{alert.type.replace("_", " ")}</span>
                    <span style={{ fontSize: 11, fontWeight: 700, color: severityColor, padding: "2px 8px", borderRadius: 100, background: `${severityColor}15` }}>{alert.severity || "MEDIUM"}</span>
                    {!alert.isRead ? (
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "#f87171" }}>
                        <div className="pulse-dot" style={{ width: 6, height: 6, background: "#f87171", animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite" }} />
                        {t.unread}
                      </div>
                    ) : (
                      <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{t.read}</span>
                    )}
                  </div>
                  <p style={{ fontSize: 15, color: "var(--text-primary)", marginBottom: 8, lineHeight: 1.4 }}>{alert.message}</p>
                  <p style={{ fontSize: 12, color: "var(--text-muted)" }}>{new Date(alert.triggeredAt).toLocaleString()}</p>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  {!alert.isRead && (
                    <button onClick={() => markRead(alert.id)} className="btn-secondary" style={{ padding: "6px 12px", fontSize: 12 }}>✓ {t.markRead}</button>
                  )}
                  <button onClick={() => deleteAlert(alert.id)} className="btn-danger" style={{ padding: "6px 12px", fontSize: 12, display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
